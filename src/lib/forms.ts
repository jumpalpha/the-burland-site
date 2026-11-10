import { SITE } from "./site";

// Page token the Apps Script checks (must match token_() in apps-script/Code.gs).
export const pageToken = (t0: number) => (Math.floor(t0 / 1000) * 7 + 1912).toString(36);
export const validEmail = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.trim()) && s.trim().length <= 254;

export type FormKind = "inquiry" | "rental" | "guide";

export async function submitForm(
  form: FormKind,
  t0: number,
  fields: Record<string, string | number | boolean | undefined | null>,
): Promise<{ ok: boolean; data?: unknown }> {
  const body = new URLSearchParams();
  body.set("form", form);
  body.set("_gotcha", "");
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null || v === false) continue;
    body.set(k, v === true ? "yes" : String(v));
  }
  body.set("t0", String(t0));
  body.set("tk", pageToken(t0));
  body.set("el", String(Math.round((Date.now() - t0) / 1000)));
  const r = await fetch(SITE.formEndpoint, { method: "POST", body });
  const j = await r.json();
  return { ok: !!j.ok, data: j.data };
}

export async function prefill(ref: string) {
  const r = await fetch(SITE.formEndpoint, { method: "POST", body: new URLSearchParams({ api: "prefill", r: ref }) });
  const j = await r.json();
  if (!j.ok || !j.data) throw new Error("prefill");
  return j.data as Record<string, string>;
}
