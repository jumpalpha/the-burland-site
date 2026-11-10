import { fmtDate } from "@/lib/dates";
import type { Quote } from "@/lib/pricing";
import { fmtUSD, POLICY } from "@/lib/site";

export function EstimateCard({ q, start, end, title = "Your estimate", children }: { q: Quote | null; start: string | null; end: string | null; title?: string; children?: React.ReactNode }) {
  return (
    <aside className="panel summary" aria-live="polite">
      <div className="eyebrow" style={{ marginBottom: 6 }}>{title}</div>
      {start ? (
        <h3 style={{ marginBottom: 4 }}>
          {fmtDate(start, { weekday: true, year: false })}
          {end && end !== start ? ` to ${fmtDate(end, { weekday: true })}` : `, ${start.slice(0, 4)}`}
        </h3>
      ) : (
        <p className="muted">Pick your dates to see an instant price.</p>
      )}
      {q && q.nights.length > 0 && <p className="small muted" style={{ margin: 0 }}>{q.nights.length} night{q.nights.length > 1 ? "s" : ""}, check-in 3:00 p.m., check-out 11:00 a.m.</p>}
      {q && q.lines.length > 0 && (
        <>
          <div className="lines">
            {q.lines.map((l) => (
              <div key={l.label}><span>{l.label}</span><span>{l.amount < 0 ? "-" : ""}{fmtUSD(Math.abs(l.amount))}</span></div>
            ))}
          </div>
          <div className="total"><span>Total</span><span>{fmtUSD(q.total)}</span></div>
          <div className="pay">
            <div><span>Due at booking (50%)</span><strong>{fmtUSD(q.dueAtBooking)}</strong></div>
            <div><span>Balance{q.balanceDue ? ` due ${fmtDate(q.balanceDue)}` : ""}</span><strong>{fmtUSD(q.balance)}</strong></div>
            <div><span>Refundable security deposit</span><strong>{fmtUSD(POLICY.securityDeposit)}</strong></div>
            <div className="small"><span>You get {fmtUSD(POLICY.securityDeposit - POLICY.cleaningFee)} back after a {fmtUSD(POLICY.cleaningFee)} cleaning fee if there&apos;s no damage.</span></div>
          </div>
        </>
      )}
      {q?.problems.map((p) => <p key={p} className="notice warn small" style={{ marginTop: 14 }}>{p}</p>)}
      {q?.notes.map((p) => <p key={p} className="notice small" style={{ marginTop: 14 }}>{p}</p>)}
      {children}
      <p className="small muted" style={{ marginTop: 16, marginBottom: 0 }}>This is an estimate. We confirm every total in writing, and nothing is booked until your agreement is signed.</p>
    </aside>
  );
}
