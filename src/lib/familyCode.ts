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

export function isValidCode(c: string) {
  return /^[A-HJ-NP-Z2-9]{8}$/.test(normalizeCode(c));
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
    throw e;
  }
  return r.json();
}

export type Tool = "meals" | "packing" | "itinerary";

export function createFamily<T>(tool: Tool, data: T) {
  return rpc<string>("family_create", { tool, d: data });
}

export function getPlan<T>(code: string, tool: Tool) {
  return rpc<{ data: T | null; version: number }>("family_get", { code: normalizeCode(code), tool });
}

export function savePlan<T>(code: string, tool: Tool, data: T, baseVersion: number) {
  return rpc<{ ok: boolean; version: number; data?: T | null }>("family_save", { code: normalizeCode(code), tool, d: data, base_version: baseVersion });
}
