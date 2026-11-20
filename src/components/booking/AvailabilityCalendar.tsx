"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { addDays, monthName, todayLocal, type ISODate } from "@/lib/dates";
import { loadAvailability, type Availability } from "@/lib/availability";
import { SITE } from "@/lib/site";

// Public, read-only availability view. It only ever knows "booked" or "holiday rate" per night —
// event titles, names and details stay private on the Google Calendar.

const pad = (n: number) => String(n).padStart(2, "0");
const DOW = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS_AHEAD = 24;

function monthDays(y: number, m: number): (ISODate | null)[] {
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: (ISODate | null)[] = Array(first).fill(null);
  for (let d = 1; d <= count; d++) cells.push(`${y}-${pad(m)}-${pad(d)}`);
  return cells;
}

export function AvailabilityCalendar() {
  const [today, setToday] = useState<ISODate | null>(null);
  const [cursor, setCursor] = useState<{ y: number; m: number } | null>(null);
  const [avail, setAvail] = useState<Availability | null>(null);

  useEffect(() => {
    const t = todayLocal();
    setToday(t);
    setCursor({ y: Number(t.slice(0, 4)), m: Number(t.slice(5, 7)) });
    loadAvailability(t, addDays(t, MONTHS_AHEAD * 31)).then(setAvail);
  }, []);

  const months = useMemo(() => {
    if (!cursor) return [];
    const second = cursor.m === 12 ? { y: cursor.y + 1, m: 1 } : { y: cursor.y, m: cursor.m + 1 };
    return [cursor, second];
  }, [cursor]);

  if (!today || !cursor) return <p className="muted small" style={{ textAlign: "center", padding: 40 }}>Loading calendar…</p>;

  const idx = cursor.y * 12 + cursor.m;
  const minIdx = Number(today.slice(0, 4)) * 12 + Number(today.slice(5, 7));
  const step = (n: number) => setCursor((c) => { if (!c) return c; const t = c.m - 1 + n; return { y: c.y + Math.floor(t / 12), m: ((t % 12) + 12) % 12 + 1 }; });
  const failed = avail && !avail.live;

  return (
    <div style={{ padding: 16 }}>
      <div className="cal-head">
        <h3>{avail ? (failed ? "Calendar unavailable right now" : "Open and booked nights") : "Checking the calendar…"}</h3>
        <div className="cal-nav">
          <button type="button" className="icon-btn" onClick={() => step(-1)} disabled={idx <= minIdx} aria-label="Previous month">&#8249;</button>
          <button type="button" className="icon-btn" onClick={() => step(1)} disabled={idx >= minIdx + MONTHS_AHEAD - 1} aria-label="Next month">&#8250;</button>
        </div>
      </div>
      {failed && (
        <p className="muted small" style={{ marginTop: 0 }}>
          We couldn&apos;t load live dates. Call or text <a href={`tel:${SITE.phone}`}>{SITE.phone}</a> and we&apos;ll check for you.
        </p>
      )}
      <div className="cal-months">
        {months.map(({ y, m }) => (
          <div className="cal-month" key={`${y}-${m}`}>
            <h4>{monthName(m)} {y}</h4>
            <div className="cal-grid" role="grid" aria-label={`${monthName(m)} ${y}`}>
              {DOW.map((d, i) => <div className="dow" key={i} aria-hidden="true">{d}</div>)}
              {monthDays(y, m).map((d, i) => {
                if (!d) return <div key={"e" + i} />;
                const past = d < today;
                const busy = !!avail?.busy.has(d);
                const holiday = !busy && !!avail?.holidays.has(d);
                const label = past ? "past" : busy ? "booked" : holiday ? "open, holiday rate" : avail?.live ? "open" : "";
                const content = (
                  <>
                    {Number(d.slice(8))}
                    {!past && busy && <small>Booked</small>}
                    {!past && holiday && <small>Holiday</small>}
                  </>
                );
                const cls = ["day", busy ? "busy" : "", holiday ? "holiday" : ""].join(" ");
                // Open future dates link straight into the planner with that arrival date.
                return !past && !busy && avail?.live ? (
                  <Link key={d} href={`/book?start=${d}`} className={cls} aria-label={`${monthName(m)} ${Number(d.slice(8))}, ${label}`} style={{ textDecoration: "none" }}>
                    {content}
                  </Link>
                ) : (
                  <div key={d} className={cls} role="gridcell" aria-label={`${monthName(m)} ${Number(d.slice(8))}${label ? ", " + label : ""}`} style={past ? { color: "#b9b4a8", cursor: "default" } : { cursor: "default" }}>
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="legend-row">
        <span><i style={{ background: "repeating-linear-gradient(45deg,#fff 0 3px,#ddd5c5 3px 5px)", border: "1px solid #ddd" }} />Booked</span>
        <span><i style={{ background: "var(--ok)" }} />Holiday rate</span>
        <span>Tap an open date to start a request</span>
      </div>
    </div>
  );
}
