import "server-only";
import { createServerClient } from "./server";
import {
  GiftProductOrder,
  GiftProductView,
  PublicGiftProduct,
  IssuedCodes,
  CreateProductPayload,
} from "@/types/gift-order";
import {
  generateCreatorKey,
  generateProductToken,
  hashSecret,
  hashSecretSync,
  normalizeCreatorKey,
  normalizeUnlockPin,
} from "@/lib/auth/crypto";

// In-memory fallback so the app still runs before Supabase credentials are configured.
const globalMemoryStore = globalThis as unknown as {
  __kp_gift_products_store?: GiftProductOrder[];
};

if (!globalMemoryStore.__kp_gift_products_store) {
  globalMemoryStore.__kp_gift_products_store = [];

  // Demo record with well-known codes (TAO-2010 / 2010). Never seeded in production.
  if (process.env.NODE_ENV !== "production") {
    globalMemoryStore.__kp_gift_products_store.push({
      id: "demo-sample-01",
      token: "KP-2010-DEMO",
      creatorKeyHash: hashSecretSync(normalizeCreatorKey("TAO-2010")),
      unlockPinHash: hashSecretSync(normalizeUnlockPin("2010")),
      customerName: "Nguyễn Văn An",
      customerEmail: "an.demo@fpt.edu.vn",
      customerPhone: "0912345678",
      chainId: "silver",
      chainName: "Bạc Ý S925 Thanh Mảnh",
      chainPrice: 45000,
      charms: [
        { id: "c1", name: "Trái Tim Ánh Hồng", price: 12000, icon: "favorite" },
        { id: "c2", name: "Hướng Dương Rạng Rỡ", price: 10000, icon: "sunny" },
      ],
      totalPrice: 67000,
      paymentMethod: "transfer",
      status: "pending",
      emailSent: true,
      createdAt: new Date().toISOString(),
    });
  }
}

const memoryStore = () => globalMemoryStore.__kp_gift_products_store!;

function getClient() {
  const supabase = createServerClient();
  if (!supabase && process.env.NODE_ENV === "production") {
    console.error("[Supabase] SUPABASE_SERVICE_ROLE_KEY is missing - orders are only kept in memory and will be lost.");
  }
  return supabase;
}

// ---------------------------------------------------------------------------
// Row mapping and views
// ---------------------------------------------------------------------------

function rowToOrder(row: any): GiftProductOrder {
  return {
    id: row.id,
    token: row.token,
    creatorKeyHash: row.creator_key || "",
    // Older rows kept the PIN inside gift_data; checkSecret upgrades those to a hash on first use.
    unlockPinHash: row.unlock_pin || row.gift_data?.pinCode || "",
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    chainId: row.chain_id,
    chainName: row.chain_name,
    chainPrice: row.chain_price,
    charms: row.charms || [],
    totalPrice: row.total_price,
    paymentMethod: row.payment_method,
    status: row.status,
    giftData: row.gift_data,
    emailSent: row.email_sent,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    deletedAt: row.deleted_at ?? undefined,
  };
}

function stripGiftSecrets(giftData: GiftProductOrder["giftData"]): GiftProductOrder["giftData"] {
  if (!giftData) return giftData;
  const { pinCode: _pinCode, ...rest } = giftData;
  return rest;
}

/** Staff view: everything except the secret hashes (and any legacy PIN left inside gift_data). */
export function toAdminView(order: GiftProductOrder): GiftProductView {
  const { creatorKeyHash: _c, unlockPinHash: _u, ...rest } = order;
  return { ...rest, giftData: stripGiftSecrets(order.giftData) };
}

/** Buyer view: no secrets and no customer contact details. */
export function toPublicView(order: GiftProductOrder): PublicGiftProduct {
  const { customerEmail: _e, customerPhone: _p, ...rest } = toAdminView(order);
  return rest;
}

// ---------------------------------------------------------------------------
// Queries
//
// With Supabase configured the database is the only source of truth: a failed write throws
// (so the caller reports an error) instead of silently succeeding in memory. The in-memory store
// is used only when Supabase is not configured at all (local development).
// ---------------------------------------------------------------------------

function dbError(action: string, error: { message: string; code?: string }): Error {
  return new Error(`[Supabase] ${action} failed: ${error.message}${error.code ? ` (${error.code})` : ""}`);
}

export async function createGiftProductInDb(
  payload: CreateProductPayload
): Promise<{ order: GiftProductOrder; issued: IssuedCodes }> {
  const issued: IssuedCodes = {
    creatorKey: generateCreatorKey(),
  };

  const order: GiftProductOrder = {
    id: crypto.randomUUID(),
    token: generateProductToken(),
    creatorKeyHash: await hashSecret(normalizeCreatorKey(issued.creatorKey)),
    unlockPinHash: "",
    customerName: payload.customerName.trim(),
    customerEmail: payload.customerEmail.trim(),
    customerPhone: payload.customerPhone?.trim(),
    chainId: payload.chainId,
    chainName: payload.chainName,
    chainPrice: payload.chainPrice,
    charms: payload.charms,
    totalPrice: payload.totalPrice,
    paymentMethod: payload.paymentMethod,
    status: "pending",
    emailSent: false,
    createdAt: new Date().toISOString(),
  };

  const supabase = getClient();
  if (!supabase) {
    memoryStore().unshift(order);
    return { order, issued };
  }

  const { data, error } = await supabase
    .from("gift_products")
    .insert({
      token: order.token,
      creator_key: order.creatorKeyHash,
      unlock_pin: order.unlockPinHash,
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      customer_phone: order.customerPhone,
      chain_id: order.chainId,
      chain_name: order.chainName,
      chain_price: order.chainPrice,
      charms: order.charms,
      total_price: order.totalPrice,
      payment_method: order.paymentMethod,
      status: order.status,
      email_sent: false,
    })
    .select("id")
    .single();

  if (error) throw dbError("insert order", error);
  order.id = data.id;
  return { order, issued };
}

// Errors for a column that does not exist yet (the soft-delete SQL was not run): Postgres 42703 on
// reads and filters, PostgREST PGRST204 when writing to it.
const MISSING_COLUMN_CODES = new Set(["42703", "PGRST204"]);
const isMissingColumn = (error: { code?: string } | null) => !!error?.code && MISSING_COLUMN_CODES.has(error.code);

/** Internal lookup. Returns secret hashes - route handlers must convert with toAdminView/toPublicView.
 * Soft-deleted orders are treated as not found. */
export async function getGiftProductByToken(token: string): Promise<GiftProductOrder | null> {
  const cleanToken = token.trim().toUpperCase();

  const supabase = getClient();
  if (!supabase) {
    const hit = memoryStore().find((item) => item.token.toUpperCase() === cleanToken);
    return hit && !hit.deletedAt ? hit : null;
  }

  let { data, error } = await supabase
    .from("gift_products")
    .select("*")
    .eq("token", cleanToken)
    .is("deleted_at", null)
    .maybeSingle();

  if (isMissingColumn(error)) {
    // Soft delete is not set up yet, so no order can be deleted: read without the filter.
    ({ data, error } = await supabase.from("gift_products").select("*").eq("token", cleanToken).maybeSingle());
  }

  if (error) throw dbError("read order", error);
  return data ? rowToOrder(data) : null;
}

/**
 * Saves the buyer's card. `newUnlockPin` (already validated as 4 digits) replaces the stored PIN
 * hash; the PIN itself is never written into gift_data. Resolves false when the token does not exist.
 */
export async function updateGiftProductCustomData(
  token: string,
  giftData: Record<string, any>,
  newUnlockPin?: string
): Promise<boolean> {
  const cleanToken = token.trim().toUpperCase();
  const completedAt = new Date().toISOString();
  const cleanGiftData = stripGiftSecrets(giftData)!;
  const requirePin = cleanGiftData.requirePin !== false;
  const unlockPinHash = requirePin && newUnlockPin ? await hashSecret(normalizeUnlockPin(newUnlockPin)) : "";

  const supabase = getClient();
  if (!supabase) {
    const item = memoryStore().find((p) => p.token.toUpperCase() === cleanToken);
    if (!item) return false;
    item.giftData = cleanGiftData;
    if (!requirePin) {
      item.unlockPinHash = "";
    } else if (unlockPinHash) {
      item.unlockPinHash = unlockPinHash;
    }
    item.status = "completed";
    item.completedAt = completedAt;
    return true;
  }

  const updateFields: Record<string, unknown> = {
    gift_data: cleanGiftData,
    status: "completed",
    completed_at: completedAt,
  };
  if (!requirePin) {
    updateFields.unlock_pin = "";
  } else if (unlockPinHash) {
    updateFields.unlock_pin = unlockPinHash;
  }

  const { data, error } = await supabase
    .from("gift_products")
    .update(updateFields)
    .eq("token", cleanToken)
    .select("id");

  if (error) throw dbError("save gift", error);
  return (data?.length ?? 0) > 0;
}

/** Replaces one of the two stored secret hashes (reset, or upgrade of a legacy plaintext value). */
export async function setGiftSecretHash(
  token: string,
  which: "creator" | "unlock",
  hash: string
): Promise<void> {
  const cleanToken = token.trim().toUpperCase();

  const supabase = getClient();
  if (!supabase) {
    const item = memoryStore().find((p) => p.token.toUpperCase() === cleanToken);
    if (item) {
      if (which === "creator") item.creatorKeyHash = hash;
      else item.unlockPinHash = hash;
    }
    return;
  }

  const { error } = await supabase
    .from("gift_products")
    .update({ [which === "creator" ? "creator_key" : "unlock_pin"]: hash })
    .eq("token", cleanToken);
  if (error) throw dbError("update secret", error);
}

export async function markProductEmailSent(token: string): Promise<void> {
  const cleanToken = token.trim().toUpperCase();

  const supabase = getClient();
  if (!supabase) {
    const item = memoryStore().find((p) => p.token.toUpperCase() === cleanToken);
    if (item) item.emailSent = true;
    return;
  }

  // Not critical: the order exists either way, so only log a failure.
  const { error } = await supabase.from("gift_products").update({ email_sent: true }).eq("token", cleanToken);
  if (error) console.warn("[Supabase] markProductEmailSent failed:", error.message);
}

export interface OrderList {
  orders: GiftProductView[];
  /** False until the `deleted_at` column exists; then orders cannot be soft-deleted yet. */
  softDeleteReady: boolean;
}

/** Orders for the admin. `trash: true` returns the soft-deleted ones instead of the active ones. */
export async function listAllGiftProducts(options: { trash?: boolean } = {}): Promise<OrderList> {
  const trash = options.trash === true;

  const supabase = getClient();
  if (!supabase) {
    const rows = memoryStore().filter((o) => (trash ? !!o.deletedAt : !o.deletedAt));
    return { orders: rows.map(toAdminView), softDeleteReady: true };
  }

  const query = supabase.from("gift_products").select("*");
  const { data, error } = await (trash ? query.not("deleted_at", "is", null) : query.is("deleted_at", null)).order(
    "created_at",
    { ascending: false }
  );

  if (isMissingColumn(error)) {
    if (trash) return { orders: [], softDeleteReady: false };
    const all = await supabase.from("gift_products").select("*").order("created_at", { ascending: false });
    if (all.error) throw dbError("list orders", all.error);
    return { orders: (all.data ?? []).map((row) => toAdminView(rowToOrder(row))), softDeleteReady: false };
  }

  if (error) throw dbError("list orders", error);
  return { orders: (data ?? []).map((row) => toAdminView(rowToOrder(row))), softDeleteReady: true };
}

/**
 * Soft-deletes (or restores) an order. Resolves false when the token does not exist; throws
 * SOFT_DELETE_UNAVAILABLE when the `deleted_at` column has not been created yet.
 */
export async function setOrderDeleted(token: string, deleted: boolean): Promise<boolean> {
  const cleanToken = token.trim().toUpperCase();
  const deletedAt = deleted ? new Date().toISOString() : null;

  const supabase = getClient();
  if (!supabase) {
    const item = memoryStore().find((p) => p.token.toUpperCase() === cleanToken);
    if (!item) return false;
    item.deletedAt = deletedAt ?? undefined;
    return true;
  }

  const { data, error } = await supabase
    .from("gift_products")
    .update({ deleted_at: deletedAt })
    .eq("token", cleanToken)
    .select("id");

  if (isMissingColumn(error)) throw new Error("SOFT_DELETE_UNAVAILABLE");
  if (error) throw dbError(deleted ? "delete order" : "restore order", error);
  return (data?.length ?? 0) > 0;
}
