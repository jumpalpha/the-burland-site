// The Burland voice assistant backend (Supabase Edge Function "burland-voice").
//
// POST {action:"session", passcode}            -> {signed_url, token}       (gate for the test page)
// POST {action:"availability", token, start_date, end_date}                  (read-only calendar check)
// POST {action:"inquiry", token, ...lead}                                    (forwards to the existing
//                                                                              Apps Script inquiry pipeline)
// Secrets (Supabase > Edge Functions > Secrets):
//   ELEVENLABS_API_KEY   ElevenLabs key (only needs Agents "read"/convai access)
//   ELEVENLABS_AGENT_ID  the Burland agent's ID
//   TEST_PASSCODE        passcode for the private test page (12+ characters)
//   ASSISTANT_MODE       "private" (default), "off" (kill switch), or "public" (no passcode; later)
//
// No Google credentials exist here. The calendar is read from its PUBLIC iCal feed,
// so this code has no way to create, change, or delete calendar events.

import { checkAvailability } from "./calendar.ts";

const ICS_URL = "https://calendar.google.com/calendar/ical/burlandevents%40gmail.com/public/basic.ics";
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyuwAzTwUtD1CHtg94bdir8_mx8_vSagoIu07MBtsykxTwnKAa6tB4ESmmFKq_-uan4/exec";
const ALLOWED_ORIGINS = ["https://theburland.com", "https://www.theburland.com", "http://localhost:8000", "http://127.0.0.1:8000"];
const TOKEN_TTL_MS = 30 * 60 * 1000;
const MAX_LEADS_PER_TOKEN = 3;

const env = (k: string) => Deno.env.get(k) ?? "";
const enc = new TextEncoder();

function cors(origin: string | null): Record<string, string> {
  const ok = origin && ALLOWED_ORIGINS.includes(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin! : "https://theburland.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Vary": "Origin",
  };
}
function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...cors(origin) },
  });
}

// ---------- signed session tokens (HMAC, no extra secret to manage) ----------
async function hmacKey() {
  const raw = await crypto.subtle.digest("SHA-256", enc.encode("burland-session|" + env("ELEVENLABS_API_KEY") + "|" + env("TEST_PASSCODE")));
  return crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
const b64 = (b: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
async function makeToken() {
  const payload = `${Date.now() + TOKEN_TTL_MS}.${crypto.randomUUID()}`;
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(payload));
  return `${payload}.${b64(sig)}`;
}
async function verifyToken(t: unknown): Promise<string | null> {
  if (typeof t !== "string") return null;
  const i = t.lastIndexOf(".");
  if (i < 0) return null;
  const payload = t.slice(0, i);
  const expect = b64(await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(payload)));
  if (!safeEqual(expect, t.slice(i + 1))) return null;
  if (Number(payload.split(".")[0]) < Date.now()) return null;
  return payload;
}
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

// ---------- light abuse limits (per warm instance) ----------
const fails = new Map<string, { n: number; until: number }>();
const leadCount = new Map<string, number>();
function blocked(ip: string) {
  const f = fails.get(ip);
  return !!f && f.n >= 5 && f.until > Date.now();
}
function noteFail(ip: string) {
  const f = fails.get(ip) ?? { n: 0, until: 0 };
  f.n += 1;
  f.until = Date.now() + 15 * 60 * 1000;
  fails.set(ip, f);
}

// ---------- handlers ----------
async function session(body: Record<string, unknown>, ip: string, origin: string | null) {
  const mode = env("ASSISTANT_MODE") || "private";
  if (mode === "off") return json({ error: "disabled", message: "The assistant is turned off right now." }, 503, origin);
  if (mode !== "public") {
    if (blocked(ip)) return json({ error: "locked", message: "Too many tries. Wait 15 minutes." }, 429, origin);
    const pass = env("TEST_PASSCODE");
    if (pass.length < 12 || !safeEqual(String(body.passcode ?? ""), pass)) {
      noteFail(ip);
      await new Promise((r) => setTimeout(r, 800));
      return json({ error: "denied", message: "That passcode didn't work." }, 401, origin);
    }
    fails.delete(ip);
  }
  const agent = env("ELEVENLABS_AGENT_ID");
  let signed_url = "";
  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agent)}`, {
      headers: { "xi-api-key": env("ELEVENLABS_API_KEY") },
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) throw new Error("status " + r.status);
    signed_url = (await r.json()).signed_url;
    if (!signed_url) throw new Error("no signed_url");
  } catch (e) {
    console.error("signed url failed", String(e));
    return json({ error: "voice_unavailable", message: "The voice service isn't reachable right now." }, 502, origin);
  }
  return json({ signed_url, token: await makeToken() }, 200, origin);
}

async function availability(body: Record<string, unknown>, origin: string | null) {
  try {
    const r = await fetch(ICS_URL, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error("ics " + r.status);
    const result = checkAvailability(await r.text(), String(body.start_date ?? ""), String(body.end_date ?? body.start_date ?? ""), new Date());
    return json(result, 200, origin);
  } catch (e) {
    console.error("calendar check failed", String(e));
    return json({ status: "unable_to_check", note: "Calendar could not be reached. Offer to send an inquiry instead." }, 200, origin);
  }
}

const clean = (v: unknown, max = 200) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);

async function inquiry(body: Record<string, unknown>, tokenPayload: string, origin: string | null) {
  if (body.consent !== true) return json({ ok: false, error: "no_consent", note: "Ask the guest for permission first." }, 200, origin);
  const n = leadCount.get(tokenPayload) ?? 0;
  if (n >= MAX_LEADS_PER_TOKEN) return json({ ok: false, error: "limit", note: "Already sent; the owner will follow up." }, 200, origin);
  const email = clean(body.email, 254).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ ok: false, error: "email", note: "Email looks incomplete. Ask them to spell it." }, 200, origin);
  const name = clean(body.name, 80);
  if (!name) return json({ ok: false, error: "name", note: "Ask for their name." }, 200, origin);

  const startDate = /^\d{4}-\d{2}-\d{2}$/.test(String(body.start_date)) ? String(body.start_date) : "";
  const summary = [
    "NEW BURLAND BOOKING INQUIRY (via AI voice assistant)",
    `Name: ${name}`,
    `Phone: ${clean(body.phone, 40)}`,
    `Email: ${email}`,
    `Event: ${clean(body.event_type, 60)}`,
    `Requested dates: ${clean(body.start_date, 10)} to ${clean(body.end_date, 10)}`,
    `Guest count: ${clean(body.guest_count, 10)}`,
    `Overnight guests: ${clean(body.overnight_guests, 10)}`,
    `Special requests: ${clean(body.special_requests, 600)}`,
    `Questions for owner: ${clean(body.followup_questions, 600)}`,
    `Tour requested: ${body.tour_requested ? "Yes" : "No"}`,
    `Calendar availability: ${clean(body.calendar_result, 120) || "not checked"}`,
    `Recommended follow-up: ${body.tour_requested ? "Schedule a tour; " : ""}confirm the date and send the rental-agreement details link.`,
  ].join("\n");

  // The existing site form adds a page token and time-on-page; we supply the same fields
  // so the inquiry goes through the normal Inquiries sheet + owner email path.
  const t0 = Date.now() - 30_000;
  const form = new URLSearchParams({
    form: "inquiry",
    t0: String(t0),
    tk: (Math.floor(t0 / 1000) * 7 + 1912).toString(36),
    el: "30",
    name,
    email,
    phone: clean(body.phone, 40),
    event_type: clean(body.event_type, 60),
    booking_date: startDate,
    nights: clean(body.nights, 3),
    max_guests: clean(body.guest_count, 6),
    overnight_guests: clean(body.overnight_guests, 6),
    found_us: "AI voice assistant",
    message: summary,
  });
  try {
    const r = await fetch(APPS_SCRIPT_URL, { method: "POST", body: form, redirect: "follow", signal: AbortSignal.timeout(15000) });
    const out = await r.json().catch(() => ({}));
    if (!r.ok || !out.ok) throw new Error("apps script " + r.status + " " + JSON.stringify(out));
    leadCount.set(tokenPayload, n + 1);
    return json({ ok: true, note: "Sent. They'll get a confirmation email; the owner usually replies within one business day." }, 200, origin);
  } catch (e) {
    console.error("lead forward failed", String(e)); // no customer details logged
    return json({ ok: false, error: "send_failed", note: "Couldn't send. Give them 208-709-1403 and burlandevents@gmail.com." }, 200, origin);
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
  if (req.method !== "POST") return json({ error: "method" }, 405, origin);
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_json" }, 400, origin);
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "?";
  if (body.action === "session") return session(body, ip, origin);
  if ((env("ASSISTANT_MODE") || "private") === "off") return json({ error: "disabled" }, 503, origin);
  const payload = await verifyToken(body.token);
  if (!payload) return json({ error: "unauthorized" }, 401, origin);
  if (body.action === "availability") return availability(body, origin);
  if (body.action === "inquiry") return inquiry(body, payload, origin);
  return json({ error: "unknown_action" }, 400, origin);
});
