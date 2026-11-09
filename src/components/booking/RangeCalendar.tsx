"use client";
import { useMemo, useState } from "react";
import { addDays, monthName, type ISODate } from "@/lib/dates";
import { nightInfo } from "@/lib/pricing";

interface Props {
  today: ISODate;
  start: ISODate | null;
  end: ISODate | null;
  single?: boolean;
  busy: Set<ISODate>;
  holidays: Set<ISODate>;
  onChange: (start: ISODate | null, end: ISODate | null) => void;
}

const pad = (n: number) => String(n).padStart(2, "0");
const DOW = ["S", "M", "T", "W", "T", "F", "S"];

function monthDays(y: number, m: number): (ISODate | null)[] {
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: (ISODate | null)[] = Array(first).fill(null);
  for (let d = 1; d <= count; d++) cells.push(`${y}-${pad(m)}-${pad(d)}`);
  return cells;
}

export function RangeCalendar({ today, start, end, single, busy, holidays, onChange }: Props) {
  const init = start ?? today;
  const [cursor, setCursor] = useState({ y: Number(init.slice(0, 4)), m: Number(init.slice(5, 7)) });
  const [hover, setHover] = useState<ISODate | null>(null);
  const maxMonth = (() => { const t = new Date(today + "T00:00:00Z"); return { y: t.getUTCFullYear() + 2, m: t.getUTCMonth() + 1 }; })();
  const months = useMemo(() => {
    const second = cursor.m === 12 ? { y: cursor.y + 1, m: 1 } : { y: cursor.y, m: cursor.m + 1 };
    return [cursor, second];
  }, [cursor]);
  const step = (n: number) => setCursor(({ y, m }) => { const t = m - 1 + n; return { y: y + Math.floor(t / 12), m: ((t % 12) + 12) % 12 + 1 }; });
  const atMin = cursor.y === Number(today.slice(0, 4)) && cursor.m === Number(today.slice(5, 7));
  const atMax = cursor.y * 12 + cursor.m >= maxMonth.y * 12 + maxMonth.m;

  // A range can't cross a booked night.
  const rangeBlocked = (a: ISODate, b: ISODate) => { for (let d = a; d < b; d = addDays(d, 1)) if (busy.has(d)) return true; return false; };

  function pick(d: ISODate) {
    if (single) return onChange(d, d);
    if (!start || (start && end)) return onChange(d, null);
    if (d <= start) return onChange(d, null);
    if (rangeBlocked(start, d)) return onChange(d, null);
    onChange(start, d);
  }
  const previewEnd = start && !end && hover && hover > start && !rangeBlocked(start, hover) ? hover : end;

  return (
    <div>
      <div className="cal-head">
        <h3>{single ? "Pick your date" : !start ? "Pick your arrival date" : end ? "Your dates (tap a day to start over)" : "Now pick your check-out date"}</h3>
        <div className="cal-nav">
          <button type="button" className="icon-btn" onClick={() => step(-1)} disabled={atMin} aria-label="Previous month">&#8249;</button>
          <button type="button" className="icon-btn" onClick={() => step(1)} disabled={atMax} aria-label="Next month">&#8250;</button>
        </div>
      </div>
      <div className="cal-months">
        {months.map(({ y, m }) => (
          <div className="cal-month" key={`${y}-${m}`}>
            <h4>{monthName(m)} {y}</h4>
            <div className="cal-grid" role="grid" aria-label={`${monthName(m)} ${y}`}>
              {DOW.map((d, i) => <div className="dow" key={i} aria-hidden="true">{d}</div>)}
              {monthDays(y, m).map((d, i) => {
                if (!d) return <div key={"e" + i} />;
                const past = d < today;
                const isBusy = busy.has(d);
                const n = nightInfo(d, [...holidays]);
                const isStart = d === start;
                const isEnd = d === previewEnd;
                const inRange = start && previewEnd && d > start && d < previewEnd;
                const cls = ["day", n.season === "peak" ? "peak" : "", n.kind === "holiday" ? "holiday" : "", isBusy ? "busy" : "", inRange ? "in" : "", isStart ? "start" : "", isEnd && !single ? "end" : ""].join(" ");
                // A busy night can still be a check-out day.
                const checkoutOk = !!start && !end && d > start && !rangeBlocked(start, d);
                const disabled = past || (isBusy && !checkoutOk);
                return (
                  <button
                    type="button"
                    key={d}
                    className={cls}
                    disabled={disabled}
                    onClick={() => pick(d)}
                    onMouseEnter={() => setHover(d)}
                    aria-pressed={isStart || isEnd}
                    aria-label={`${monthName(m)} ${Number(d.slice(8))}, ${isBusy ? "booked" : `$${n.rate} ${n.kind} night`}`}
                  >
                    {Number(d.slice(8))}
                    {!past && !isBusy && <small>${n.rate >= 1000 ? (n.rate / 1000).toFixed(1).replace(".0", "") + "k" : n.rate}</small>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="legend-row">
        <span><i style={{ background: "var(--evergreen)" }} />Your dates</span>
        <span><i style={{ background: "var(--sand)" }} />Nights in your stay</span>
        <span><i style={{ background: "repeating-linear-gradient(45deg,#fff 0 3px,#ddd5c5 3px 5px)", border: "1px solid #ddd" }} />Booked</span>
        <span>Prices shown are per night for the whole building</span>
      </div>
    </div>
  );
}
