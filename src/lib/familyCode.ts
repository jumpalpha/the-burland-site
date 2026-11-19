// One shared family code covers every planning tool (meals, packing, itinerary). Plans live in
// Supabase (worst-songs project, burland_tools schema), reached only through the family_* RPCs.
const SB_URL = "https://vvjgriwldvnqnlgzvnvs.supabase.co";
const SB_KEY = "sb_publishable_wns9aERfjHvFgMla8vB6Lw_shmufhsx";

export function normalizeCode(c: string) {
  return c.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function formatCode(c: string) {
  const n = normalizeCode(c);
  return n.length === 8 ? `${n.slice(0, 4)}-${n.slice(4)}` : n;
}

// Random codes are 8 characters; families can also pick their own 6 to 12 letters and numbers.
export function isValidCode(c: string) {
  return /^[A-Z0-9]{6,12}$/.test(normalizeCode(c));
}

// Short or all-letter codes are allowed but easier for strangers to guess.
export function isEasyToGuess(c: string) {
  const n = normalizeCode(c);
  return n.length < 8 || !/[0-9]/.test(n);
}

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const r = await fetch(`${SB_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: SB_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  if (!r.ok) {
    let m = "";
    try { m = (await r.json()).message || ""; } catch {}
    const e = new Error(m || `HTTP ${r.status}`) as Error & { notFound?: boolean };
    e.notFound = /not found/i.test(m);
    (e as Error & { taken?: boolean }).taken = /taken/i.test(m);
    throw e;
  }
  const t = await r.text();
  return (t ? JSON.parse(t) : null) as T;
}

export type Tool = "meals" | "packing" | "itinerary";

export function createFamily<T>(tool: Tool, data: T) {
  return rpc<string>("family_create", { tool, d: data });
}

export function claimFamily<T>(code: string, tool: Tool, data: T) {
  return rpc<string>("family_claim", { code: normalizeCode(code), tool, d: data });
}

export function getPlan<T>(code: string, tool: Tool) {
  return rpc<{ data: T | null; version: number }>("family_get", { code: normalizeCode(code), tool });
}

export function savePlan<T>(code: string, tool: Tool, data: T, baseVersion: number) {
  return rpc<{ ok: boolean; version: number; data?: T | null }>("family_save", { code: normalizeCode(code), tool, d: data, base_version: baseVersion });
}

export type BoardPage = Tool | "plan";
export interface BoardMessage { id: number; author: string; body: string; page: BoardPage | null; at: string }

export function listMessages(code: string, afterId = 0) {
  return rpc<BoardMessage[]>("family_board_list", { code: normalizeCode(code), after_id: afterId });
}

export function postMessage(code: string, author: string, body: string, page: BoardPage) {
  return rpc<{ id: number; at: string }>("family_board_post", { code: normalizeCode(code), author, body, page });
}

export function deleteMessage(code: string, id: number) {
  return rpc<null>("family_board_delete", { code: normalizeCode(code), id });
}
