import "server-only";
import { createServerClient } from "./server";
import { DEFAULT_CHAINS, type Chain } from "@/config/catalog";

/**
 * Bracelet chains that staff sell and edit from the admin.
 * Stored in the `chains` table. Until that table exists (the SQL has not been run yet) the built-in
 * defaults are served read-only so ordering keeps working; `editable` tells the UI which mode it is in.
 */
export interface StoredChain extends Chain {
  active: boolean;
  sortOrder: number;
}

export interface ChainList {
  chains: StoredChain[];
  editable: boolean;
}

export const MAX_CHAIN_PRICE = 10_000_000;
export const MAX_CHAINS = 50;

// Swatch colours handed out to new chains in turn.
const PALETTE = ["#DCC0C0", "#FEA095", "#FAF0ED", "#897172", "#C9A66B", "#9DB4A0", "#A7B8D8", "#D8B4D0"];

const MISSING_TABLE_CODES = new Set(["PGRST205", "42P01"]);

const defaults = (): StoredChain[] =>
  DEFAULT_CHAINS.map((c, i) => ({ ...c, active: true, sortOrder: i }));

// Development without Supabase: an in-memory list that can be edited.
const memory = globalThis as unknown as { __kp_chains?: StoredChain[] };
const memoryChains = () => (memory.__kp_chains ??= defaults());

type Row = {
  id: string;
  name: string;
  price: number;
  color: string;
  description: string;
  active: boolean;
  sort_order: number;
};

const fromRow = (r: Row): StoredChain => ({
  id: r.id,
  name: r.name,
  price: r.price,
  color: r.color,
  desc: r.description ?? "",
  active: r.active,
  sortOrder: r.sort_order,
});

function fail(action: string, error: { message: string; code?: string }): Error {
  return new Error(`[Supabase] ${action} failed: ${error.message}${error.code ? ` (${error.code})` : ""}`);
}

export async function listChains(): Promise<ChainList> {
  const supabase = createServerClient();
  if (!supabase) return { chains: memoryChains(), editable: true };

  const { data, error } = await supabase
    .from("chains")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    if (error.code && MISSING_TABLE_CODES.has(error.code)) return { chains: defaults(), editable: false };
    throw fail("list chains", error);
  }
  return { chains: (data as Row[]).map(fromRow), editable: true };
}

/** An active chain by id (what an order may be sold with), or undefined. */
export async function getActiveChain(id: unknown): Promise<Chain | undefined> {
  if (typeof id !== "string") return undefined;
  const { chains } = await listChains();
  const hit = chains.find((c) => c.id === id && c.active);
  return hit && { id: hit.id, name: hit.name, price: hit.price, color: hit.color, desc: hit.desc };
}

export interface ChainInput {
  name: string;
  price: number;
  description?: string;
}

const slug = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);

export async function createChain(input: ChainInput): Promise<StoredChain> {
  const { chains, editable } = await listChains();
  if (!editable) throw new Error("CHAINS_TABLE_MISSING");
  if (chains.length >= MAX_CHAINS) throw new Error("CHAINS_LIMIT");

  const chain: StoredChain = {
    id: `${slug(input.name) || "chain"}-${crypto.randomUUID().slice(0, 6)}`,
    name: input.name,
    price: input.price,
    color: PALETTE[chains.length % PALETTE.length],
    desc: input.description ?? "",
    active: true,
    sortOrder: chains.reduce((max, c) => Math.max(max, c.sortOrder), -1) + 1,
  };

  const supabase = createServerClient();
  if (!supabase) {
    memoryChains().push(chain);
    return chain;
  }

  const { error } = await supabase.from("chains").insert({
    id: chain.id,
    name: chain.name,
    price: chain.price,
    color: chain.color,
    description: chain.desc,
    active: true,
    sort_order: chain.sortOrder,
  });
  if (error) throw fail("create chain", error);
  return chain;
}

export interface ChainPatch {
  name?: string;
  price?: number;
  description?: string;
  active?: boolean;
}

/** Updates a chain. Resolves to the updated chain, or null when the id does not exist. */
export async function updateChain(id: string, patch: ChainPatch): Promise<StoredChain | null> {
  const { editable } = await listChains();
  if (!editable) throw new Error("CHAINS_TABLE_MISSING");

  const supabase = createServerClient();
  if (!supabase) {
    const hit = memoryChains().find((c) => c.id === id);
    if (!hit) return null;
    if (patch.name !== undefined) hit.name = patch.name;
    if (patch.price !== undefined) hit.price = patch.price;
    if (patch.description !== undefined) hit.desc = patch.description;
    if (patch.active !== undefined) hit.active = patch.active;
    return hit;
  }

  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.price !== undefined) update.price = patch.price;
  if (patch.description !== undefined) update.description = patch.description;
  if (patch.active !== undefined) update.active = patch.active;

  const { data, error } = await supabase.from("chains").update(update).eq("id", id).select("*");
  if (error) throw fail("update chain", error);
  return data && data.length > 0 ? fromRow(data[0] as Row) : null;
}
