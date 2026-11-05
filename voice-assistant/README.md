# Burland Voice Assistant — Owner Guide

## How it fits together

```
Phone/browser  ──>  theburland.com/voice-assistant-test   (static page, GitHub Pages)
                        │ passcode
                        ▼
                Supabase edge function "burland-voice"     (project: worst-songs, free tier)
                 ├─ checks passcode, gets a 15-min ElevenLabs signed URL (API key stays here)
                 ├─ availability: asks the "Burland Voice Calendar (read-only)" Apps Script
                 │    (burlandevents@gmail.com, view-only calendar permission) for busy dates
                 └─ inquiry: forwards to the existing Apps Script → Inquiries sheet + email to burlandevents@gmail.com
                        ▼
                ElevenLabs agent "The Burland Receptionist" (voice, LLM, knowledge base)
```

Nothing touches the live calendar except reading. The assistant has no way to book, hold, or change a date.
The calendar script returns only busy start/end times, never names or titles. Source: `calendar-apps-script/`.
(Google's public calendar feed was tried first: it was rate-limited from the server and missed a booking, so it's not used.)

## Test it
1. Open `https://theburland.com/voice-assistant-test` (live only after the branch is merged — see Deploy).
2. Enter the passcode (sent to you in chat; only its hash is in the code). To change it, set a `TEST_PASSCODE` secret in Supabase and that replaces it. Tick "Remember on this device" on your phone.
3. Tap the mic, allow microphone, talk. Or type in the box.
4. "Lock" forgets the passcode on that device.

## Update business info
- **Facts, prices, policies, FAQs:** ElevenLabs → Agents → The Burland Receptionist → Knowledge Base → open "Burland facts" → edit → Save.
  Keep `voice-assistant/knowledge-base.md` in this repo in sync (it's the master copy).
- Mark anything unsure with `[CONFIRM WITH OWNER]`; the assistant won't state it as fact.
- **Greeting:** Agent → "First message".
- **Voice:** Agent → Voice → pick another voice → Save.
- **Behavior:** Agent → System prompt (master copy: `agent-prompt.md`).

## Review inquiries
Same as website inquiries: email to burlandevents@gmail.com and a row in the **Inquiries** tab of
"The Burland: Emails and Inquiries" sheet. Voice leads show `found_us: AI voice assistant` and a full summary.

## Credits (read this)
The Free plan gives 10,000 credits a month. Setup testing used all of them on 2026-11-04; they reset 2026-12-05.
Until then, or until you upgrade to Starter, conversations won't connect. Automated tests also spend credits, so run them sparingly.

## Monitor usage and cost
- ElevenLabs → Developers/Usage (minutes and credits) and Agents → Conversations (history).
- Set Agent → Advanced → **Max conversation duration** to 600 s (10 min).
- Keep prepaid balance auto top-up **off**; set a usage alert at 80% of included minutes.
- Supabase and Apps Script stay on free tiers at this volume.

## Turn it off
Fastest first:
1. Supabase → Edge Functions → Secrets → set `ASSISTANT_MODE` = `off`. Every request is refused immediately.
2. ElevenLabs → Agent → disable / delete the agent.
3. Remove the page (rollback below).

## Change the passcode
Supabase → Edge Functions → Secrets → add `TEST_PASSCODE` = new value (12+ characters). It overrides the built-in one; old remembered devices stop working.

## Clean up after setup
Supabase → Edge Functions: delete `burland-voice-admin` and `burland-voice-debug` once you're happy (keep `burland-voice`).

## Admin function (temporary)
`burland-voice-admin` builds/updates the agent from `agent-prompt.md` + `knowledge-base.md` in this repo and runs tests. Its source template is `admin-function/template.ts` (the deployed copy holds a private access key). Delete it in Supabase when setup is finished; to re-sync agent text later without it, edit in the ElevenLabs dashboard.

## Deploy / rollback
- Work lives on branch `voice-assistant-dev`. GitHub Pages serves only `main`, so the branch is invisible until merged.
- Deploy: merge the PR into `main`. Pages rebuilds in ~1 minute. Adds only new files + two lines in robots.txt; no existing page changes.
- Rollback the page: revert the merge commit on `main` (GitHub → the merge commit → Revert), or delete `voice-assistant-test.html`.
- Rollback the backend: set `ASSISTANT_MODE=off`, or delete the `burland-voice` function in Supabase.
- Tests: `deno run voice-assistant/edge-function/calendar_test.ts`.

## Monthly cost estimate
ElevenLabs agent pricing, checked 2026-11-04. Plan prices and included minutes are from elevenlabs.io/pricing/agents (confirmed).
The $0.08/min extra-minute rate is from a third-party breakdown dated Oct 2026 because ElevenLabs' own table was ambiguous (estimate).
LLM cost uses Gemini 2.5 Flash at ~$0.0012/min (estimate). Hosting, calendar, notifications: $0.

| Minutes/mo | Cheapest plan math | Est. total |
|---|---|---|
| 100 | Starter $6 (75 incl) + 25 × $0.08 + LLM | ~$8 |
| 250 | Starter $6 + 175 × $0.08, or Creator $22 (275 incl) | ~$20–22 |
| 500 | Creator $22 + 225 × $0.08 (Starter ties) | ~$41 |
| 1,000 | Creator $22 + 725 × $0.08 (Pro $99 has 1,238 incl) | ~$81 |

- Free plan: 15 agent minutes/month, enough for owner testing only; commercial use is listed on Starter and up.
- Risks: abandoned sessions burn minutes (capped by max duration); bots (blocked by passcode now, needs rate limits before public launch); bursts over plan concurrency bill at ~$0.16/min.

## Known open items (need the owner)
See `knowledge-base.md` lines marked CONFLICT / MISSING: capacity numbers, Thu–Sun peak total, check-out time, cancellation policy, house rules.
