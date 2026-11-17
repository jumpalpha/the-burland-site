# Burland Basecamp, Episode 4 schedule (DRAFT for Alan)

Episode: 4, "Lava country: the other side of Eastern Idaho"
Status: draft plan only. Nothing is published, merged, or posted.
Drafted: 2026-11-16 by Chief of Staff.

## Proposed publish date

**Wednesday, November 25, 2026.**

- Every other week from Episode 3 (published Thursday, Nov 12) lands on Thursday, Nov 26. That is Thanksgiving.
- Publishing one day early keeps the rhythm and puts the episode out while families are together and talking about next year's trips.
- Alan can pick Nov 26 instead. Every other date below moves with it.
- After that: Episode 5 around Wednesday, Dec 9, then Dec 23.

## Steps and owners

| By | Step | Who | Done when |
|---|---|---|---|
| Tue Nov 17 | Fact-check the ep04 source pack (basecamp/notebooklm/ep04-source-pack.md): EBR-I open season, Craters of the Moon cave and Loop Road seasonal access, Menan Buttes and Hell's Half Acre facts. No drive times, no invented details. | Agent (internal), fixes on basecamp-dev | Fix list reported; pack updated on basecamp-dev |
| Wed Nov 18 | Add a seasonal note to the pack: the episode comes out in late November, so frame it as "plan it for spring and summer" and tell listeners to check current conditions. | Agent (internal) | Note in the pack |
| Thu Nov 19 | Alan approves the final pack. | Alan | Alan's yes |
| Fri Nov 20 | Generate the Audio Overview in NotebookLM: a new notebook with the pack as the only source, plus ep04-customize-prompt.txt. | Alan, or an agent in the Burland account with Alan's OK | Audio file downloaded |
| Sat Nov 21 | Listen through the audio for any drive times, wrong numbers, or claims not in the pack. Regenerate if needed. This is the step ep02 skipped. | Alan or Milly (about 15 to 20 minutes) | Audio approved |
| Mon Nov 23 | Run scripts/compress-episode.sh on the audio, then in src/lib/basecamp.ts set Episode 4 to audio "/basecamp/audio/ep04.mp3", status "live", date "November 2026", and the length. Run the type check and build. | Agent, on basecamp-dev | Build passes; the dev page shows the episode |
| Tue Nov 24 | Alan approves the merge to main. | Alan | Alan's yes, typed in the session doing the merge |
| Wed Nov 25 | Merge, deploy, and confirm the live /basecamp page plays Episode 4. | Agent | Live check passes |
| Optional | A social post announcing Episode 4: draft it for Alan. It schedules only on his yes. Nov 25 and 26 are open in Metricool; Nov 24 already has a post. | Agent drafts, Alan approves | Alan's yes |

## Decisions needed from Alan

1. Publish on Wed Nov 25 (recommended) or Thu Nov 26.
2. Who generates the audio in NotebookLM: Alan, or an agent with his OK.
3. Who listens to the audio before it goes live: Alan or Milly.
4. Whether to announce Episode 4 on social.

## Related open item

Decision d14, the ep02 audio check, is still open. The same listen-through step above would cover it: listen to the live Episode 2 for "300 feet", the Fairy Falls half-mile claim, and the 6:30 to 9:00 timing.
