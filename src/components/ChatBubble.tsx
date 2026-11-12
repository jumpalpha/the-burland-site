"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/site";

const API = "https://vvjgriwldvnqnlgzvnvs.supabase.co/functions/v1/burland-voice";
const HIDE_ON = /^\/(owner|rental|voice-assistant)/;
const STARTERS = ["What does it cost?", "Is my date open?", "How many people can stay?"];

type Msg = { who: "ai" | "me" | "sys"; text: string };
type Convo = { sendUserMessage: (t: string) => void; endSession: () => Promise<void> };

async function call(body: Record<string, unknown>) {
  const r = await fetch(API, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  return { ok: r.ok, data: await r.json().catch(() => ({})) };
}

export function ChatBubble() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [thinking, setThinking] = useState(false);
  const convo = useRef<Convo | null>(null);
  const token = useRef("");
  const greeted = useRef(false);
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const add = (m: Msg) => setMsgs((x) => [...x, m]);
  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight }); }, [msgs, thinking]);
  useEffect(() => { if (open) input.current?.focus(); }, [open]);
  useEffect(() => () => { convo.current?.endSession().catch(() => {}); }, []);

  if (HIDE_ON.test(path)) return null;

  async function connect() {
    const s = await call({ action: "chat" });
    if (!s.ok) {
      add({ who: "sys", text: s.data.message || `Chat isn't available right now. Call or text ${SITE.phone}.` });
      return null;
    }
    token.current = s.data.token;
    greeted.current = false;
    const { Conversation } = await import("@elevenlabs/client");
    const c = await Conversation.startSession({
      signedUrl: s.data.signed_url,
      textOnly: true,
      clientTools: {
        check_availability: async (p: { start_date: string; end_date?: string }) => {
          const r = await call({ action: "availability", token: token.current, start_date: p.start_date, end_date: p.end_date || p.start_date });
          return JSON.stringify(r.ok ? r.data : { status: "unable_to_check", note: "Calendar could not be checked. Offer to send an inquiry." });
        },
        submit_inquiry: async (p: Record<string, unknown>) => {
          const r = await call({ ...p, action: "inquiry", channel: "chat", token: token.current });
          if (r.data.ok) add({ who: "sys", text: "Your details were sent to The Burland." });
          return JSON.stringify(r.ok ? r.data : { ok: false, note: `Couldn't send. Give them ${SITE.phone}.` });
        },
      },
      onMessage: (m: { source?: string; role?: string; message: string }) => {
        if (m.source !== "ai" && m.role !== "agent") return;
        // The agent's spoken greeting repeats the bubble's built-in welcome.
        if (!greeted.current) { greeted.current = true; if (/welcome to The Burland/i.test(m.message)) return; }
        setThinking(false);
        add({ who: "ai", text: m.message.replace(/\s{2,}/g, " ").trim() });
      },
      onDisconnect: () => { convo.current = null; setThinking(false); },
      onError: () => { setThinking(false); },
    });
    convo.current = c as unknown as Convo;
    return convo.current;
  }

  async function send(t: string) {
    t = t.trim();
    if (!t || busy) return;
    setText("");
    add({ who: "me", text: t });
    setBusy(true);
    try {
      const c = convo.current ?? (await connect());
      if (!c) return;
      setThinking(true);
      c.sendUserMessage(t);
    } catch {
      convo.current = null;
      setThinking(false);
      add({ who: "sys", text: `Something went wrong. Try again, or call or text ${SITE.phone}.` });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="chat no-print">
      {open && (
        <div className="chat-panel" role="dialog" aria-label="Chat with The Burland">
          <div className="chat-head">
            <div>
              <strong>Ask The Burland</strong>
              <span>AI assistant. The owner confirms every booking.</span>
            </div>
            <button type="button" className="chat-x" aria-label="Close chat" onClick={() => setOpen(false)}>&times;</button>
          </div>
          <div className="chat-log" ref={log} aria-live="polite">
            <div className="chat-msg ai">Hi! I can answer questions about The Burland and check whether your dates look open. What are you planning?</div>
            {msgs.length === 0 && (
              <div className="chat-starters">
                {STARTERS.map((s) => <button key={s} type="button" onClick={() => send(s)}>{s}</button>)}
              </div>
            )}
            {msgs.map((m, i) => <div key={i} className={`chat-msg ${m.who}`}>{m.text}</div>)}
            {thinking && <div className="chat-msg ai chat-dots" aria-label="Assistant is typing"><i /><i /><i /></div>}
          </div>
          <form className="chat-form" onSubmit={(e) => { e.preventDefault(); send(text); }}>
            <input ref={input} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your question" aria-label="Type your question" maxLength={500} autoComplete="off" />
            <button type="submit" className="btn btn-brass btn-sm" disabled={busy || !text.trim()}>Send</button>
          </form>
          <p className="chat-note">You&apos;re chatting with an AI. If you share contact details, they go only to The Burland. Chats are processed by ElevenLabs.</p>
        </div>
      )}
      <button type="button" className="chat-btn" aria-expanded={open} aria-label={open ? "Close chat" : "Chat with us"} onClick={() => setOpen(!open)}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />}
        </svg>
        {!open && <span>Ask a question</span>}
      </button>
    </div>
  );
}
