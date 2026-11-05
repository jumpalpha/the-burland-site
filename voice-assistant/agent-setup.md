# ElevenLabs agent settings

- Name: The Burland Receptionist
- Language: English. Voice: a warm American English voice (pick in the Voice tab).
- LLM: Gemini 2.5 Flash (cheap, fast). Temperature low (~0.3).
- First message: "Hi, welcome to The Burland! I'm the virtual assistant here. Are you planning a family reunion, a wedding, or another get-together?"
- System prompt: contents of `agent-prompt.md`.
- Knowledge base: text document "Burland facts" = contents of `knowledge-base.md`. RAG off (small doc, included whole).
- Security: **Enable authentication** (signed URLs only). No allowlist (signed URLs and allowlists are exclusive).
- Overrides: allow "text only" so the page's typed chat works.
- Advanced: max conversation duration 600 s. Turn off audio recording retention if offered; keep transcripts the minimum period.

## Client tools (Tools → Add tool → Client, "Wait for response" ON)

### check_availability
Description: Check whether dates look open on the Burland calendar. Call after confirming dates with the guest.
Parameters:
- start_date (string, required): arrival date, YYYY-MM-DD.
- end_date (string, required): departure date, YYYY-MM-DD; same as start_date for a single-day event.

### submit_inquiry
Description: Send the guest's booking inquiry to the owner. Only after the guest says yes to sending it.
Parameters:
- consent (boolean, required): true only after the guest agreed to send their details.
- name (string, required)
- email (string, required)
- phone (string)
- event_type (string): e.g. Family reunion, Wedding, Reception, Retreat, Party.
- start_date (string): YYYY-MM-DD.
- end_date (string): YYYY-MM-DD.
- nights (number)
- guest_count (number): most guests at one time.
- overnight_guests (number)
- special_requests (string)
- followup_questions (string): questions the assistant couldn't answer.
- tour_requested (boolean)
- calendar_result (string): what check_availability returned, if run.
