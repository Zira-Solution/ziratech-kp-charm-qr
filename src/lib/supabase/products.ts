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
  generateUnlockPin,
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
// ---------------------------------------------------------------------------

export async function createGiftProductInDb(
  payload: CreateProductPayload
): Promise<{ order: GiftProductOrder; issued: IssuedCodes }> {
  const issued: IssuedCodes = {
    creatorKey: generateCreatorKey(),
    unlockPin: generateUnlockPin(),
  };

  const order: GiftProductOrder = {
    id: crypto.randomUUID(),
    token: generateProductToken(),
    creatorKeyHash: await hashSecret(normalizeCreatorKey(issued.creatorKey)),
    unlockPinHash: await hashSecret(normalizeUnlockPin(issued.unlockPin)),
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
  if (supabase) {
    try {
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
        .select()
        .single();

      if (error) {
        console.warn("[Supabase] Insert error, saving to memory fallback:", error.message);
      } else if (data) {
        order.id = data.id;
      }
    } catch (err) {
      console.warn("[Supabase] Connection exception, falling back to memory store:", err);
    }
  }

  memoryStore().unshift(order);
  return { order, issued };
}

/** Internal lookup. Returns secret hashes - route handlers must convert with toAdminView/toPublicView. */
export async function getGiftProductByToken(token: string): Promise<GiftProductOrder | null> {
  const cleanToken = token.trim().toUpperCase();

  const supabase = getClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("gift_products")
        .select("*")
        .eq("token", cleanToken)
        .single();

      if (!error && data) return rowToOrder(data);
    } catch (err) {
      console.warn("[Supabase] Query error, checking memory store:", err);
    }
  }

  return memoryStore().find((item) => item.token.toUpperCase() === cleanToken) ?? null;
}

/**
 * Saves the buyer's card. `newUnlockPin` (already validated as 4 digits) replaces the stored PIN
 * hash; the PIN itself is never written into gift_data.
 */
export async function updateGiftProductCustomData(
  token: string,
  giftData: Record<string, any>,
  newUnlockPin?: string
): Promise<boolean> {
  const cleanToken = token.trim().toUpperCase();
  const completedAt = new Date().toISOString();
  const cleanGiftData = stripGiftSecrets(giftData)!;
  const unlockPinHash = newUnlockPin ? await hashSecret(normalizeUnlockPin(newUnlockPin)) : undefined;

  let saved = false;

  const supabase = getClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("gift_products")
        .update({
          gift_data: cleanGiftData,
          ...(unlockPinHash ? { unlock_pin: unlockPinHash } : {}),
          status: "completed",
          completed_at: completedAt,
        })
        .eq("token", cleanToken);

      if (error) {
        console.warn("[Supabase] Update error:", error.message);
      } else {
        saved = true;
      }
    } catch (err) {
      console.warn("[Supabase] Update exception:", err);
    }
  }

  const item = memoryStore().find((p) => p.token.toUpperCase() === cleanToken);
  if (item) {
    item.giftData = cleanGiftData;
    if (unlockPinHash) item.unlockPinHash = unlockPinHash;
    item.status = "completed";
    item.completedAt = completedAt;
    saved = true;
  }

  return saved;
}

/** Replaces one of the two stored secret hashes (reset, or upgrade of a legacy plaintext value). */
export async function setGiftSecretHash(
  token: string,
  which: "creator" | "unlock",
  hash: string
): Promise<void> {
  const cleanToken = token.trim().toUpperCase();
  const column = which === "creator" ? "creator_key" : "unlock_pin";

  const supabase = getClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("gift_products")
        .update({ [column]: hash })
        .eq("token", cleanToken);
      if (error) console.warn("[Supabase] setGiftSecretHash error:", error.message);
    } catch (err) {
      console.warn("[Supabase] setGiftSecretHash exception:", err);
    }
  }

  const item = memoryStore().find((p) => p.token.toUpperCase() === cleanToken);
  if (item) {
    if (which === "creator") item.creatorKeyHash = hash;
    else item.unlockPinHash = hash;
  }
}

export async function markProductEmailSent(token: string): Promise<void> {
  const cleanToken = token.trim().toUpperCase();

  const supabase = getClient();
  if (supabase) {
    try {
      await supabase
        .from("gift_products")
        .update({ email_sent: true })
        .eq("token", cleanToken);
    } catch (err) {
      console.warn("[Supabase] markProductEmailSent exception:", err);
    }
  }

  const item = memoryStore().find((p) => p.token.toUpperCase() === cleanToken);
  if (item) {
    item.emailSent = true;
  }
}

export async function listAllGiftProducts(): Promise<GiftProductView[]> {
  const supabase = getClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("gift_products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((row) => toAdminView(rowToOrder(row)));
      }
    } catch (err) {
      console.warn("[Supabase] listAllGiftProducts exception, using memory store:", err);
    }
  }

  return memoryStore().map(toAdminView);
}
