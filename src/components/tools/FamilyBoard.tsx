"use client";
import { useEffect, useRef, useState } from "react";
import { deleteMessage, listMessages, postMessage, type BoardMessage, type BoardPage } from "@/lib/familyCode";
import { useStored } from "@/lib/useStored";

const PAGE_LABEL: Record<BoardPage, string> = { meals: "Meals", packing: "What to bring", itinerary: "Itinerary", plan: "Planning" };

const when = (iso: string) => {
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString([], { month: "short", day: "numeric" }) + ", " + d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

/** Open discussion for everyone with the family code. One thread shared by every planning page. */
export function FamilyBoard({ code, page, noCodeHint }: { code: string; page: BoardPage; noCodeHint?: React.ReactNode }) {
  const [name, setName] = useStored<string>("burland-family-name", "");
  const [mine, setMine] = useStored<number[]>("burland-board-mine", []);
  const [msgs, setMsgs] = useState<BoardMessage[]>([]);
  const [text, setText] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);
  const lastCount = useRef(0);

  const load = async () => {
    if (!code || document.hidden) return;
    try { setMsgs(await listMessages(code)); setErr(""); }
    catch { setErr("Couldn't load messages. Check your connection."); }
  };

  useEffect(() => {
    setMsgs([]); lastCount.current = 0;
    if (!code) return;
    load();
    const id = setInterval(load, 8000);
    window.addEventListener("focus", load);
    return () => { clearInterval(id); window.removeEventListener("focus", load); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // Keep the newest message in view when new ones arrive.
  useEffect(() => {
    if (msgs.length > lastCount.current && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    lastCount.current = msgs.length;
  }, [msgs]);

  const send = async () => {
    const body = text.trim();
    if (!body || !name.trim()) return;
    setSending(true); setErr("");
    try {
      const r = await postMessage(code, name.trim(), body, page);
      setMine([...mine, r.id]);
      setText("");
      await load();
    } catch (e) { setErr((e as Error).message || "Couldn't post. Try again."); }
    finally { setSending(false); }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this message for everyone?")) return;
    try { await deleteMessage(code, id); setMsgs(msgs.filter((m) => m.id !== id)); } catch { setErr("Couldn't delete. Try again."); }
  };

  const saveName = () => { const n = nameDraft.trim().slice(0, 40); if (n) { setName(n); setEditingName(false); } };

  return (
    <section className="panel no-print" aria-labelledby="family-board-h" style={{ display: "grid", gap: 14 }}>
      <div>
        <h2 id="family-board-h" style={{ fontSize: "1.4rem", margin: "0 0 6px" }}>Family discussion</h2>
        <p className="small muted" style={{ margin: 0 }}>
          Your family&apos;s open space to ask questions, share ideas, and work out the plan together, right next to the plan itself.
          Everyone with your family code sees every message, so nothing gets buried in a group text someone missed.
          It&apos;s the same conversation on the meals, what to bring, and itinerary pages.
        </p>
      </div>

      {!code ? (
        <p className="small" style={{ margin: 0 }}><strong>{noCodeHint ?? "Create or join a family code above to start the conversation."}</strong></p>
      ) : (
        <>
          <ol ref={listRef} aria-live="polite" style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10, maxHeight: 420, overflowY: "auto" }}>
            {msgs.length === 0 && <li className="small muted">No messages yet. Start with a question, like &ldquo;Who&apos;s bringing the dutch ovens?&rdquo;</li>}
            {msgs.map((m) => (
              <li key={m.id} className="notice" style={{ display: "grid", gap: 4 }}>
                <div className="small" style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                  <strong>{m.author}</strong>
                  <span className="muted">{when(m.at)}{m.page ? ` · ${PAGE_LABEL[m.page]}` : ""}</span>
                  {mine.includes(m.id) && <button type="button" className="x-btn" style={{ marginLeft: "auto" }} aria-label="Delete your message" onClick={() => remove(m.id)}>&times;</button>}
                </div>
                <div style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{m.body}</div>
              </li>
            ))}
          </ol>

          {!name || editingName ? (
            <form className="row" style={{ gap: 8, flexWrap: "wrap" }} onSubmit={(e) => { e.preventDefault(); saveName(); }}>
              <input className="input" aria-label="Your name" placeholder="Your name, e.g. Grandma Dopp" maxLength={40} value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} style={{ maxWidth: 260 }} />
              <button type="submit" className="btn btn-line btn-sm" disabled={!nameDraft.trim()}>{name ? "Save name" : "Set my name"}</button>
            </form>
          ) : (
            <p className="small muted" style={{ margin: 0 }}>
              Posting as <strong>{name}</strong> ·{" "}
              <button type="button" className="x-btn" style={{ color: "var(--ink-2)", fontSize: "inherit", textDecoration: "underline", padding: 0 }} onClick={() => { setNameDraft(name); setEditingName(true); }}>change</button>
            </p>
          )}

          <form style={{ display: "grid", gap: 8 }} onSubmit={(e) => { e.preventDefault(); send(); }}>
            <textarea className="input" aria-label="Message" placeholder={name ? "Ask a question or share an idea..." : "Set your name first, then write your message"} maxLength={2000} rows={3} value={text} onChange={(e) => setText(e.target.value)} disabled={!name} />
            <div className="row" style={{ gap: 8 }}>
              <button type="submit" className="btn btn-dark btn-sm" disabled={sending || !name || !text.trim()}>{sending ? "Posting..." : "Post"}</button>
              {err && <span className="small" role="alert">{err}</span>}
            </div>
          </form>
        </>
      )}
    </section>
  );
}
