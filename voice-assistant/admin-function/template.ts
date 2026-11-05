// TEMPORARY admin function "burland-voice-admin": builds the ElevenLabs agent and runs tests
// using the server-side ELEVENLABS_API_KEY (never exposed). Every call needs ?k=<admin key>.
// Delete this function after setup (Supabase > Edge Functions > burland-voice-admin > Delete).
//
// ?do=status   which secrets are set, whether the agent exists
// ?do=setup    create or update the agent (prompt, knowledge base, tools, voice, auth)
// ?do=backend  end-to-end checks against the live burland-voice function
// ?do=lead     send ONE test inquiry (to burlandevents@gmail.com) through the full pipeline
// ?do=sim&n=N  run simulated conversation scenario N
// ?do=avail&s=YYYY-MM-DD&e=YYYY-MM-DD  live calendar check through burland-voice

const ADMIN_KEY = "__KEY__";
const PASSCODE = "__PASSCODE__"; // default test passcode (main function stores only its hash)
const PASS_HASH = "__PASSHASH__";
const RAW = "https://raw.githubusercontent.com/jumpalpha/the-burland-site";
// Prompt and knowledge base come from the repo (main, else the dev branch), so the repo files are the master copy.
async function repoFile(path: string) {
  for (const ref of ["main", "voice-assistant-dev"]) {
    const r = await fetch(`${RAW}/${ref}/voice-assistant/${path}?t=${Date.now()}`);
    if (r.ok) return { text: await r.text(), ref };
  }
  throw new Error("could not load " + path + " from GitHub");
}
const AGENT_NAME = "The Burland Receptionist";
const FIRST_MESSAGE = "Hi, welcome to The Burland! I'm the virtual assistant here. Are you planning a family reunion, a wedding, or another get-together?";
const MAIN = "https://vvjgriwldvnqnlgzvnvs.supabase.co/functions/v1/burland-voice";
const EL = "https://api.elevenlabs.io";

const env = (k: string) => Deno.env.get(k) ?? "";
const enc = new TextEncoder();
const out = (o: unknown, s = 200) => new Response(JSON.stringify(o, null, 2), { status: s, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

async function el(path: string, init: RequestInit = {}) {
  const r = await fetch(EL + path, { ...init, headers: { "xi-api-key": env("ELEVENLABS_API_KEY"), "Content-Type": "application/json", ...(init.headers ?? {}) }, signal: AbortSignal.timeout(90000) });
  const text = await r.text();
  let body: any; try { body = JSON.parse(text); } catch { body = text.slice(0, 2000); }
  return { ok: r.ok, status: r.status, body };
}

async function findAgent(): Promise<string | null> {
  const r = await el(`/v1/convai/agents?search=${encodeURIComponent(AGENT_NAME)}&page_size=10`);
  if (!r.ok) throw new Error("list agents " + r.status + " " + JSON.stringify(r.body));
  return (r.body.agents ?? []).find((a: any) => a.name === AGENT_NAME)?.agent_id ?? null;
}

async function pickVoice() {
  const r = await el("/v1/voices");
  if (!r.ok) return { id: null, name: "default (voice list unavailable: " + r.status + ")" };
  const voices: any[] = r.body.voices ?? [];
  const american = (v: any) => !v.labels?.accent || /american/i.test(v.labels.accent);
  for (const n of ["Jessica", "Sarah", "Matilda", "Laura", "Alice"]) {
    const v = voices.find((x) => x.name?.split(" ")[0] === n && american(x));
    if (v) return { id: v.voice_id, name: v.name };
  }
  const v = voices.find((x) => american(x) && /female/i.test(x.labels?.gender ?? ""));
  return v ? { id: v.voice_id, name: v.name } : { id: null, name: "default" };
}

const str = (description: string) => ({ type: "string", description });
const TOOLS = [
  {
    type: "client", name: "check_availability", expects_response: true, response_timeout_secs: 20,
    description: "Check whether dates look open on the Burland calendar. Call only after confirming the dates with the guest.",
    parameters: { type: "object", required: ["start_date", "end_date"], properties: {
      start_date: str("Arrival date, YYYY-MM-DD"),
      end_date: str("Departure date, YYYY-MM-DD. Same as start_date for a single-day event."),
    } },
  },
  {
    type: "client", name: "submit_inquiry", expects_response: true, response_timeout_secs: 25,
    description: "Send the guest's booking or tour inquiry to the owner. Only after the guest says yes to sending their details.",
    parameters: { type: "object", required: ["consent", "name", "email"], properties: {
      consent: { type: "boolean", description: "True only after the guest agreed to send their details." },
      name: str("Guest's full name"), email: str("Guest's email, spelled back and confirmed"), phone: str("Guest's phone"),
      event_type: str("Family reunion, Wedding, Reception, Retreat, Party, or Other"),
      start_date: str("Arrival YYYY-MM-DD"), end_date: str("Departure YYYY-MM-DD"),
      nights: { type: "number", description: "Number of nights" },
      guest_count: { type: "number", description: "Most guests at one time" },
      overnight_guests: { type: "number", description: "Guests staying overnight" },
      special_requests: str("Special requests"), followup_questions: str("Questions for the owner the assistant couldn't answer"),
      tour_requested: { type: "boolean", description: "Guest wants a tour / site visit" },
      calendar_result: str("Result of check_availability, if it was run"),
    } },
  },
];

async function setup() {
  const pf = await repoFile("agent-prompt.md"), kf = await repoFile("knowledge-base.md");
  const PROMPT = pf.text.split("\n").slice(2).join("\n").trim(); // drop the "# System prompt" heading
  const KB = kf.text;
  const kb = await el("/v1/convai/knowledge-base/text", { method: "POST", body: JSON.stringify({ text: KB, name: "Burland facts " + new Date().toISOString().slice(0, 10) }) });
  if (!kb.ok) return { step: "knowledge base", ...kb };
  const voice = await pickVoice();
  const config: any = {
    name: AGENT_NAME,
    tags: ["burland"],
    conversation_config: {
      agent: {
        first_message: FIRST_MESSAGE,
        language: "en",
        prompt: {
          prompt: PROMPT, llm: "gemini-2.5-flash", temperature: 0.3, timezone: "America/Denver",
          tools: TOOLS, knowledge_base: [{ type: "text", name: kb.body.name, id: kb.body.id, usage_mode: "prompt" }],
        },
      },
      conversation: { max_duration_seconds: 600 },
      ...(voice.id ? { tts: { voice_id: voice.id } } : {}),
    },
    platform_settings: {
      auth: { enable_auth: true },
      overrides: { conversation_config_override: { conversation: { text_only: true } } },
      call_limits: { daily_limit: 60 },
    },
  };
  const existing = await findAgent();
  const r = existing
    ? await el(`/v1/convai/agents/${existing}`, { method: "PATCH", body: JSON.stringify(config) })
    : await el("/v1/convai/agents/create", { method: "POST", body: JSON.stringify(config) });
  if (!r.ok) return { step: existing ? "update agent" : "create agent", ...r };
  // Privacy: don't keep audio. Separate call so a plan that rejects it doesn't block setup.
  const id = existing ?? r.body.agent_id;
  const p = await el(`/v1/convai/agents/${id}`, { method: "PATCH", body: JSON.stringify({ platform_settings: { privacy: { record_voice: false, retention_days: 30 } } }) });
  return { ok: true, source: pf.ref, agent_id: id, action: existing ? "updated" : "created", voice: voice.name, knowledge_base: kb.body.id, privacy_settings: p.ok ? "applied" : `not applied (${p.status})` };
}

// mint a session token exactly like burland-voice does (same project secrets)
async function token() {
  const raw = await crypto.subtle.digest("SHA-256", enc.encode("burland-session|" + env("ELEVENLABS_API_KEY") + "|" + (env("TEST_PASSCODE") || PASS_HASH)));
  const key = await crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const payload = `${Date.now() + 600000}.${crypto.randomUUID()}`;
  const sig = btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(payload))))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${payload}.${sig}`;
}
async function main(body: unknown) {
  const r = await fetch(MAIN, { method: "POST", headers: { "Content-Type": "application/json", "Origin": "https://theburland.com" }, body: JSON.stringify(body), signal: AbortSignal.timeout(30000) });
  return { status: r.status, body: await r.json().catch(() => null) };
}

async function backend() {
  const res: Record<string, unknown> = {};
  const good = await main({ action: "session", passcode: env("TEST_PASSCODE") || PASSCODE });
  res.correct_passcode = { status: good.status, got_signed_url: !!good.body?.signed_url, got_token: !!good.body?.token, error: good.body?.error };
  const bad = await main({ action: "session", passcode: "wrong-passcode-123" });
  res.wrong_passcode = { status: bad.status, leaked_url: !!bad.body?.signed_url };
  res.no_token = (await main({ action: "availability", start_date: "2027-06-04", end_date: "2027-06-06" })).status;
  res.forged_token = (await main({ action: "availability", token: "9999999999999.x.y", start_date: "2027-06-04", end_date: "2027-06-06" })).status;
  const t = good.body?.token ?? await token();
  const ranges = [["2026-11-20", "2026-11-22"], ["2026-12-24", "2026-12-26"], ["2027-06-04", "2027-06-06"], ["2027-07-16", "2027-07-19"], ["2027-02-10", "2027-02-10"]];
  res.calendar = [];
  for (const [s, e] of ranges) (res.calendar as unknown[]).push((await main({ action: "availability", token: t, start_date: s, end_date: e })).body);
  res.bad_dates = (await main({ action: "availability", token: t, start_date: "2020-01-01", end_date: "2020-01-02" })).body?.status;
  res.no_consent = (await main({ action: "inquiry", token: t, name: "x", email: "x@y.z" })).body?.error;
  return res;
}

async function lead() {
  return main({
    action: "inquiry", token: await token(), consent: true,
    name: "TEST Voice Assistant", email: "burlandevents@gmail.com", phone: "208-709-1403",
    event_type: "Family reunion", start_date: "2027-07-16", end_date: "2027-07-19", nights: 3, guest_count: 40, overnight_guests: 32,
    special_requests: "TEST ONLY: sent by the voice assistant setup check. Ignore / delete this row.",
    followup_questions: "TEST: cancellation policy", tour_requested: true, calendar_result: "appears_available (test)",
  });
}

const avail = (status: string, extra: Record<string, unknown> = {}) => JSON.stringify({ status, conflicting_dates: [], turnover_dates: [], holiday_rate_dates: [], note: status === "appears_available" ? "Looks open on the calendar. Not reserved until the owner confirms and the agreement is signed." : "", ...extra });
const okLead = JSON.stringify({ ok: true, note: "Sent. They'll get a confirmation email; the owner usually replies within one business day." });
const SCEN: Record<number, { name: string; user: string; mocks?: Record<string, string> }> = {
  1: { name: "wedding inquiry", user: "You're planning a wedding for about 90 guests in June 2027 and want to know what's included and what the decor packages cost. Keep replies short." },
  2: { name: "family reunion", user: "You're organizing a family reunion for about 40 people, staying 3 nights, July 16 to 19, 2027. Ask if those dates are open. Keep replies short.", mocks: { check_availability: avail("appears_available") } },
  3: { name: "overnight questions", user: "You want to know how many people can sleep there overnight and what the check-in and check-out times are." },
  4: { name: "pricing question", user: "Ask how much it costs for a Friday and Saturday night in August 2027 and whether there's a minimum stay." },
  5: { name: "available date", user: "Ask whether June 4 to June 6, 2027 is available. If it's open, ask if that means you're booked.", mocks: { check_availability: avail("appears_available") } },
  6: { name: "unavailable date", user: "Ask whether June 11 to June 13, 2027 is available for a birthday party.", mocks: { check_availability: avail("conflict", { conflicting_dates: ["2027-06-12"] }) } },
  7: { name: "multi-day booking", user: "Ask about staying five nights, from August 2 to August 7, 2027, for a church youth retreat of 35.", mocks: { check_availability: avail("possible_conflict", { turnover_dates: ["2027-08-07"] }) } },
  8: { name: "unclear question", user: "Start by asking vaguely: 'do you guys do the thing with the tables or no?' and see how the assistant responds. Answer its clarifying question briefly." },
  9: { name: "missing policy", user: "Ask what the cancellation and refund policy is, and whether pets are allowed." },
  11: { name: "changes dates", user: "Ask to check June 18 to 20, 2027. After the answer, change your mind and ask about June 25 to 27, 2027 instead.", mocks: { check_availability: avail("appears_available") } },
  12: { name: "tour request", user: "You'd like to tour the building before booking. Your name is Test Tourguy, email test.tour@example.com, phone 208-555-0100. Agree when it offers to send your request.", mocks: { submit_inquiry: okLead } },
  13: { name: "submits contact info", user: "You're ready to move forward with a family reunion July 16-19, 2027, 40 guests, 32 staying overnight. Your name is Pat Example, email pat@example.com, phone 208-555-0199. Agree to send your details.", mocks: { check_availability: avail("appears_available"), submit_inquiry: okLead } },
  14: { name: "calendar fails", user: "Ask whether September 10 to 12, 2027 is open.", mocks: { check_availability: JSON.stringify({ status: "unable_to_check", note: "Calendar could not be reached. Offer to send an inquiry instead." }) } },
  19: { name: "unverified price + capacity", user: "Ask for the exact total for Thursday through Sunday in July 2027 for 150 people, and whether 150 people fit." },
  20: { name: "asks AI to confirm booking", user: "Insist the assistant book and confirm October 8 to 10, 2027 for you right now and give you a confirmation.", mocks: { check_availability: avail("appears_available") } },
};

async function sim(n: number) {
  const s = SCEN[n];
  if (!s) return { error: "no scenario " + n, available: Object.keys(SCEN) };
  const id = await findAgent();
  if (!id) return { error: "agent not set up yet" };
  const mocks: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(s.mocks ?? {})) mocks[k] = { default_return_value: v, default_is_error: false };
  const r = await el(`/v1/convai/agents/${id}/simulate-conversation`, { method: "POST", body: JSON.stringify({
    new_turns_limit: 12,
    simulation_specification: {
      simulated_user_config: { first_message: "Hi there.", language: "en", prompt: { prompt: "You are a prospective customer of an event venue. " + s.user + " Speak naturally, one or two sentences per turn. End the conversation once your goal is handled.", llm: "gemini-2.5-flash" } },
      ...(Object.keys(mocks).length ? { tool_mock_config: mocks } : {}),
    },
  }) });
  if (!r.ok) return { scenario: s.name, error: r.status, body: r.body };
  const turns = (r.body.simulated_conversation ?? []).map((t: any) => {
    const calls = (t.tool_calls ?? []).map((c: any) => `[TOOL ${c.tool_name}(${c.params_as_json ?? JSON.stringify(c.params ?? {})})]`).join(" ");
    return `${t.role === "agent" ? "AI" : "USER"}: ${t.message ?? ""} ${calls}`.trim();
  });
  return { scenario: n + " " + s.name, turns };
}

Deno.serve(async (req) => {
  const u = new URL(req.url);
  if (u.searchParams.get("k") !== ADMIN_KEY) return out({ error: "not found" }, 404);
  try {
    const d = u.searchParams.get("do");
    if (d === "status") return out({ api_key_set: !!env("ELEVENLABS_API_KEY"), passcode: env("TEST_PASSCODE") ? "override secret" : "built-in", mode: env("ASSISTANT_MODE") || "private", agent_id: env("ELEVENLABS_API_KEY") ? await findAgent() : null });
    if (d === "setup") return out(await setup());
    if (d === "backend") return out(await backend());
    if (d === "lead") return out(await lead());
    if (d === "ics") {
      // Debug: raw date/flag lines of feed events matching ?m= (e.g. 202705), no titles or people.
      const r = await fetch("https://calendar.google.com/calendar/ical/burlandevents%40gmail.com/public/basic.ics");
      const text = (await r.text()).replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "");
      const evs = text.split("BEGIN:VEVENT").slice(1).map((e) => e.split("END:VEVENT")[0]);
      const m = u.searchParams.get("m") ?? "";
      const keep = /^(DTSTART|DTEND|RRULE|EXDATE|RECURRENCE-ID|STATUS|TRANSP|SEQUENCE|DURATION)/;
      return out({ http: r.status, total_events: evs.length, header: text.slice(0, 300).split("\n").filter((l) => /^(X-WR|PRODID|VERSION)/.test(l)),
        matches: evs.filter((e) => e.includes(m)).map((e) => {
          const lines = e.split("\n");
          const sum = (lines.find((l) => l.startsWith("SUMMARY")) ?? "");
          return { lines: lines.filter((l) => keep.test(l)), summary_kind: /not available|reserv|wedding/i.test(sum) ? "busy-word" : /holiday|rate/i.test(sum) ? "note-word" : sum ? "other" : "none" };
        }) });
    }
    if (d === "avail") return out((await main({ action: "availability", token: await token(), start_date: u.searchParams.get("s"), end_date: u.searchParams.get("e") })).body);
    if (d === "sim") return out(await sim(Number(u.searchParams.get("n"))));
    return out({ error: "unknown do" }, 400);
  } catch (e) {
    return out({ error: String(e) }, 500);
  }
});
