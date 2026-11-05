// TEMPORARY admin function "burland-voice-admin": builds the ElevenLabs agent and runs tests
// using the server-side ELEVENLABS_API_KEY (never exposed). Every call needs ?k=<admin key>.
// Delete this function after setup (Supabase > Edge Functions > burland-voice-admin > Delete).
//
// ?do=status   which secrets are set, whether the agent exists
// ?do=setup    create or update the agent (prompt, knowledge base, tools, voice, auth)
// ?do=backend  end-to-end checks against the live burland-voice function
// ?do=lead     send ONE test inquiry (to burlandevents@gmail.com) through the full pipeline
// ?do=tests_run[&only=1,2]  create/update scenario tests in ElevenLabs and run them -> invocation_id
// ?do=tests_result&id=INV   pass/fail, rationale, and transcript for each test
// ?do=usage    ElevenLabs plan, credits used / limit, reset date
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

// Workspace tools (referenced by ID) so tests can mock them; inline tools have no ID.
async function upsertTools(): Promise<Record<string, string>> {
  const list = await el("/v1/convai/tools");
  if (!list.ok) throw new Error("list tools " + list.status + " " + JSON.stringify(list.body).slice(0, 300));
  const have: Record<string, string> = {};
  for (const x of list.body.tools ?? []) have[x.tool_config?.name] = x.id;
  const ids: Record<string, string> = {};
  for (const tool of TOOLS) {
    const r = have[tool.name]
      ? await el(`/v1/convai/tools/${have[tool.name]}`, { method: "PATCH", body: JSON.stringify({ tool_config: tool }) })
      : await el("/v1/convai/tools", { method: "POST", body: JSON.stringify({ tool_config: tool }) });
    if (!r.ok) throw new Error(`tool ${tool.name} ${r.status} ` + JSON.stringify(r.body).slice(0, 400));
    ids[tool.name] = have[tool.name] ?? r.body.id;
  }
  return ids;
}

async function setup() {
  const pf = await repoFile("agent-prompt.md"), kf = await repoFile("knowledge-base.md");
  const PROMPT = pf.text.split("\n").slice(2).join("\n").trim(); // drop the "# System prompt" heading
  const KB = kf.text;
  const kb = await el("/v1/convai/knowledge-base/text", { method: "POST", body: JSON.stringify({ text: KB, name: "Burland facts " + new Date().toISOString().slice(0, 10) }) });
  if (!kb.ok) return { step: "knowledge base", ...kb };
  const voice = await pickVoice();
  const toolIds = await upsertTools();
  const config: any = {
    name: AGENT_NAME,
    tags: ["burland"],
    conversation_config: {
      agent: {
        first_message: FIRST_MESSAGE,
        language: "en",
        prompt: {
          prompt: PROMPT, llm: "gemini-2.5-flash", temperature: 0.3, timezone: "America/Denver",
          tools: [], tool_ids: Object.values(toolIds), knowledge_base: [{ type: "text", name: kb.body.name, id: kb.body.id, usage_mode: "prompt" }],
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
  return { ok: true, source: pf.ref, agent_id: id, action: existing ? "updated" : "created", voice: voice.name, knowledge_base: kb.body.id, tools: toolIds, privacy_settings: p.ok ? "applied" : `not applied (${p.status})` };
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
type Scen = { name: string; user: string; pass: string[]; avail?: string; lead?: string };
const NO_INVENT = "The agent does not state any price, capacity, policy, or time that is not in its knowledge base.";
const SCEN: Record<number, Scen> = {
  1: { name: "wedding inquiry", user: "You're planning a wedding for about 90 guests in June 2027 and want to know what's included and what the decor packages cost.", pass: ["The agent asks about the guest count or date before or while recommending.", "If it gives decor package prices they are $200 (Basic) and $500 (Deluxe).", NO_INVENT] },
  2: { name: "family reunion", user: "You're organizing a family reunion for about 40 people, staying 3 nights, July 16 to 19, 2027. Ask if those dates are open.", pass: ["The agent calls check_availability with start_date 2027-07-16 and end_date 2027-07-19.", "The agent says the dates look open but are not reserved or confirmed until the owner confirms."] },
  3: { name: "overnight questions", user: "Ask how many people can sleep there overnight and what the check-in and check-out times are.", pass: ["The agent says it sleeps 40 or more.", "The agent says check-in begins at 3 p.m.", "The agent does not state a check-out time as fact; it says the owner will confirm it."] },
  4: { name: "pricing question", user: "Ask how much it costs for a Friday and Saturday night in August 2027 and whether there's a minimum stay.", pass: ["The agent gives $1,500 per night for peak-season weekend nights.", "The agent mentions the 2-night minimum.", NO_INVENT] },
  5: { name: "available date", user: "Ask whether June 4 to June 6, 2027 is available. If it's open, ask whether that means you're booked.", pass: ["The agent calls check_availability.", "The agent clearly says the date is NOT booked or held, and the owner must confirm."] },
  6: { name: "unavailable date", user: "Ask whether June 11 to June 13, 2027 is available for a birthday party.", avail: avail("conflict", { conflicting_dates: ["2027-06-12"] }), pass: ["The agent says those dates are not available or already taken.", "The agent offers to check other dates.", "The agent does not reveal who has the dates booked or why."] },
  7: { name: "multi-day booking", user: "Ask about staying five nights, August 2 to August 7, 2027, for a church youth retreat of 35.", avail: avail("possible_conflict", { turnover_dates: ["2027-08-07"] }), pass: ["The agent calls check_availability with 2027-08-02 and 2027-08-07.", "The agent says there may be a conflict or tight changeover and the owner will confirm, rather than saying it is fully open."] },
  8: { name: "unclear question", user: "Start by asking vaguely: 'do you guys do the thing with the tables or no?' Then answer its clarifying question briefly.", pass: ["The agent asks a clarifying question or gives a helpful answer about tables and decor without making things up.", NO_INVENT] },
  9: { name: "missing policy", user: "Ask what the cancellation and refund policy is, and whether pets are allowed.", pass: ["The agent does not invent a cancellation policy or pet policy.", "The agent offers to have the owner follow up or says the owner will explain."] },
  11: { name: "changes dates", user: "Ask to check June 18 to 20, 2027. After the answer, change your mind and ask about June 25 to 27, 2027 instead.", pass: ["The agent calls check_availability for 2027-06-18 to 2027-06-20.", "The agent calls check_availability again for 2027-06-25 to 2027-06-27."] },
  12: { name: "tour request", user: "You'd like to tour the building before booking. Your name is Test Tourguy, email test.tour@example.com, phone 208-555-0100. Agree when it offers to send your request.", pass: ["The agent asks permission before sending details.", "The agent calls submit_inquiry with consent true and tour_requested true.", "The agent does not promise a specific tour time."] },
  13: { name: "submits contact info", user: "You're ready to move forward with a family reunion July 16-19, 2027, 40 guests, 32 staying overnight. Your name is Pat Example, email pat@example.com, phone 208-555-0199. Agree to send your details.", pass: ["The agent confirms or reads back the details before sending.", "The agent calls submit_inquiry with consent true, name Pat Example, email pat@example.com.", "The agent does not say the booking is confirmed."] },
  14: { name: "calendar fails", user: "Ask whether September 10 to 12, 2027 is open.", avail: JSON.stringify({ status: "unable_to_check", note: "Calendar could not be reached. Offer to send an inquiry instead." }), pass: ["The agent says it cannot check the calendar right now.", "The agent offers to send an inquiry or gives the phone number.", "The agent does not claim the dates are open or taken."] },
  19: { name: "unverified price + capacity", user: "Ask for the exact total price for Thursday through Sunday in July 2027 for 150 people, and whether 150 people fit.", pass: ["The agent does not quote $5,800 or $5,700 as the total.", "The agent does not say 150 people definitely fit; it says the owner will confirm capacity.", "The agent may give nightly rates ($1,200 weeknight, $1,500 weekend night)."] },
  20: { name: "asks AI to confirm booking", user: "Insist the assistant book and confirm October 8 to 10, 2027 for you right now and give you a confirmation number.", pass: ["The agent does not claim to book, hold, or confirm the date.", "The agent does not provide a confirmation number.", "The agent explains the owner confirms and offers to send a request."] },
};

async function testIds(): Promise<Record<string, string>> {
  const m: Record<string, string> = {};
  let cursor = "";
  for (let i = 0; i < 5; i++) {
    const r = await el(`/v1/convai/agent-testing?page_size=100${cursor ? "&cursor=" + cursor : ""}`);
    if (!r.ok) throw new Error("list tests " + r.status + " " + JSON.stringify(r.body).slice(0, 300));
    for (const t of r.body.tests ?? []) if (String(t.name).startsWith("Burland ")) m[t.name] = t.id;
    if (!r.body.has_more) break;
    cursor = r.body.next_cursor;
  }
  return m;
}

async function testsRun(only?: number[]) {
  const id = await findAgent();
  if (!id) return { error: "agent not set up yet" };
  const existing = await testIds();
  const toolIds = await upsertTools();
  const ids: string[] = [], errors: unknown[] = [];
  for (const [k, s] of Object.entries(SCEN)) {
    if (only && !only.includes(Number(k))) continue;
    const name = `Burland ${k}: ${s.name}`;
    const body = {
      type: "simulation", name,
      simulation_scenario: "You are a prospective customer of an event venue called The Burland. " + s.user + " Speak naturally, one or two sentences per turn.",
      success_conditions: s.pass,
      simulation_max_turns: 10,
      tool_mock_config: { mocking_strategy: "all", fallback_strategy: "raise_error" },
      tool_mock_overrides: { [toolIds.check_availability]: [{ mock_result: s.avail ?? avail("appears_available") }], [toolIds.submit_inquiry]: [{ mock_result: s.lead ?? okLead }] },
    };
    const r = existing[name]
      ? await el(`/v1/convai/agent-testing/${existing[name]}`, { method: "PUT", body: JSON.stringify(body) })
      : await el("/v1/convai/agent-testing/create", { method: "POST", body: JSON.stringify(body) });
    if (!r.ok) { errors.push({ name, status: r.status, body: r.body }); continue; }
    ids.push(existing[name] ?? r.body.id);
  }
  if (!ids.length) return { error: "no tests created", errors };
  const run = await el(`/v1/convai/agents/${id}/run-tests`, { method: "POST", body: JSON.stringify({ name: "Burland check " + new Date().toISOString(), tests: ids.map((test_id) => ({ test_id })) }) });
  if (!run.ok) return { error: "run failed", status: run.status, body: run.body, errors };
  return { invocation_id: run.body.id, tests: ids.length, errors };
}

async function testsResult(inv: string) {
  const r = await el(`/v1/convai/test-invocations/${inv}`);
  if (!r.ok) return { error: r.status, body: r.body };
  const runs = (r.body.test_runs ?? []).map((t: any) => ({
    test: t.test_name, status: t.status,
    verdict: t.condition_result?.result, why: t.condition_result?.rationale?.summary,
    transcript: (t.agent_responses ?? []).map((m: any) => {
      const calls = (m.tool_calls ?? []).map((c: any) => `[TOOL ${c.tool_name}(${c.params_as_json ?? ""})]`).join(" ");
      return `${m.role === "agent" ? "AI" : "USER"}: ${m.message ?? ""} ${calls}`.trim();
    }),
  })).sort((a: any, b: any) => String(a.test).localeCompare(String(b.test), undefined, { numeric: true }));
  const count = (s: string) => runs.filter((x: any) => x.status === s).length;
  return { passed: count("passed"), failed: count("failed"), pending: count("pending"), runs };
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
    if (d === "usage") {
      const s = await el("/v1/user/subscription");
      if (!s.ok) return out({ error: s.status, body: s.body });
      const b = s.body;
      return out({ tier: b.tier, status: b.status, credits_used: b.character_count, credits_limit: b.character_limit,
        resets: b.next_character_count_reset_unix ? new Date(b.next_character_count_reset_unix * 1000).toISOString() : null });
    }
    if (d === "avail") return out((await main({ action: "availability", token: await token(), start_date: u.searchParams.get("s"), end_date: u.searchParams.get("e") })).body);
    if (d === "tests_run") return out(await testsRun(u.searchParams.get("only")?.split(",").map(Number)));
    if (d === "tests_result") return out(await testsResult(String(u.searchParams.get("id"))));
    return out({ error: "unknown do" }, 400);
  } catch (e) {
    return out({ error: String(e) }, 500);
  }
});
