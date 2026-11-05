// Read-only availability check against the Burland public iCal feed.
// Returns only dates and a status, never event titles or details.

export type Result =
  | { status: "appears_available" | "conflict" | "possible_conflict"; start_date: string; end_date: string; nights: number;
      conflicting_dates: string[]; turnover_dates: string[]; holiday_rate_dates: string[]; note: string }
  | { status: "invalid_dates"; note: string };

const TZ = "America/Denver";
const BUSY = /reserv|not available|unavailable|booked|block|hold|closed|private|rented|event|wedding|reunion|party/i;
const NOTE_ONLY = /holiday|\brate\b|\$\s?\d/i;

const DAY = 86400000;
const toMs = (ymd: string) => Date.UTC(+ymd.slice(0, 4), +ymd.slice(5, 7) - 1, +ymd.slice(8, 10));
const toYmd = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const addDays = (ymd: string, n: number) => toYmd(toMs(ymd) + n * DAY);
const isYmd = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && toYmd(toMs(s)) === s;

function localYmd(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

type Prop = { params: Record<string, string>; value: string };
type Ev = Record<string, Prop[]>;

function parseIcs(text: string): Ev[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "").split("\n");
  const out: Ev[] = [];
  let cur: Ev | null = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") { cur = {}; continue; }
    if (line === "END:VEVENT") { if (cur) out.push(cur); cur = null; continue; }
    if (!cur) continue;
    const c = line.indexOf(":");
    if (c < 0) continue;
    const [name, ...ps] = line.slice(0, c).split(";");
    const params: Record<string, string> = {};
    for (const p of ps) { const [k, v] = p.split("="); params[k.toUpperCase()] = v ?? ""; }
    (cur[name.toUpperCase()] ??= []).push({ params, value: line.slice(c + 1) });
  }
  return out;
}

// Returns {date, allDay, midnight} where date is the local calendar date.
function propDate(p: Prop): { date: string; allDay: boolean; midnight: boolean } | null {
  const v = p.value.trim();
  const m = v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
  if (!m) return null;
  const ymd = `${m[1]}-${m[2]}-${m[3]}`;
  if (!m[4] || p.params.VALUE === "DATE") return { date: ymd, allDay: true, midnight: true };
  if (m[7]) {
    const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]));
    const local = localYmd(d);
    const hm = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);
    return { date: local, allDay: false, midnight: hm === "00:00" };
  }
  return { date: ymd, allDay: false, midnight: m[4] === "00" && m[5] === "00" }; // TZID local time
}

// Dates (inclusive) that one occurrence covers.
function coverage(start: { date: string; allDay: boolean }, end: { date: string; allDay: boolean; midnight: boolean } | null) {
  let last = start.date;
  if (end) {
    last = end.allDay || end.midnight ? addDays(end.date, -1) : end.date;
    if (toMs(last) < toMs(start.date)) last = start.date;
  }
  return { first: start.date, last };
}

const WD = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

// Expand occurrence start dates that could touch [winFrom, winTo].
function occurrences(first: string, spanDays: number, rrule: string | undefined, exdates: Set<string>, winFrom: string, winTo: string): string[] {
  if (!rrule) return [first];
  const r: Record<string, string> = {};
  for (const kv of rrule.split(";")) { const [k, v] = kv.split("="); r[k] = v; }
  const freq = r.FREQ, interval = Math.max(1, +(r.INTERVAL || 1));
  const count = r.COUNT ? +r.COUNT : Infinity;
  const until = r.UNTIL ? `${r.UNTIL.slice(0, 4)}-${r.UNTIL.slice(4, 6)}-${r.UNTIL.slice(6, 8)}` : "9999-12-31";
  const lo = toMs(winFrom) - (spanDays + 1) * DAY, hi = toMs(winTo);
  const out: string[] = [];
  let n = 0;
  const push = (d: string) => {
    n++;
    if (d > until || n > count) return false;
    if (!exdates.has(d) && toMs(d) >= lo && toMs(d) <= hi) out.push(d);
    return toMs(d) <= hi;
  };
  if (freq === "WEEKLY" && r.BYDAY) {
    const days = r.BYDAY.split(",").map((d) => WD.indexOf(d.slice(-2)));
    const f = toMs(first), weekStart = f - new Date(f).getUTCDay() * DAY;
    for (let w = 0; w < 3000; w += interval) {
      for (const wd of days.sort()) {
        const d = weekStart + (w * 7 + wd) * DAY;
        if (d < f) continue;
        if (!push(toYmd(d))) return out;
      }
    }
    return out;
  }
  for (let i = 0; i < 20000; i++) {
    const base = new Date(toMs(first));
    let d: Date;
    if (freq === "DAILY") d = new Date(base.getTime() + i * interval * DAY);
    else if (freq === "WEEKLY") d = new Date(base.getTime() + i * interval * 7 * DAY);
    else if (freq === "MONTHLY") { d = new Date(base); d.setUTCMonth(base.getUTCMonth() + i * interval); if (d.getUTCDate() !== base.getUTCDate()) continue; }
    else if (freq === "YEARLY") { d = new Date(base); d.setUTCFullYear(base.getUTCFullYear() + i * interval); if (d.getUTCDate() !== base.getUTCDate()) continue; }
    else return [first]; // unknown rule: treat as single occurrence
    if (!push(toYmd(d.getTime()))) return out;
  }
  return out;
}

export function checkAvailability(ics: string, start: string, end: string, now: Date): Result {
  if (!isYmd(start) || !isYmd(end)) return { status: "invalid_dates", note: "Dates must be YYYY-MM-DD." };
  if (end < start) return { status: "invalid_dates", note: "Departure is before arrival. Confirm the dates." };
  if (start < localYmd(now)) return { status: "invalid_dates", note: "That date has already passed. Confirm the year." };
  const nights = Math.round((toMs(end) - toMs(start)) / DAY);
  if (nights > 30) return { status: "invalid_dates", note: "That's over 30 nights. Ask the owner directly." };

  // Days the guest occupies: each night, or the single event day.
  const occupied = new Set<string>();
  for (let i = 0; i < Math.max(1, nights); i++) occupied.add(addDays(start, i));

  const conflicts = new Set<string>(), turnover = new Set<string>(), holiday = new Set<string>();
  for (const ev of parseIcs(ics)) {
    if ((ev.STATUS?.[0]?.value ?? "").toUpperCase() === "CANCELLED") continue;
    const s = ev.DTSTART?.[0] && propDate(ev.DTSTART[0]);
    if (!s) continue;
    const e = ev.DTEND?.[0] ? propDate(ev.DTEND[0]) : null;
    const cov = coverage(s, e);
    const span = Math.round((toMs(cov.last) - toMs(cov.first)) / DAY);
    const summary = ev.SUMMARY?.[0]?.value ?? "";
    const transparent = (ev.TRANSP?.[0]?.value ?? "").toUpperCase() === "TRANSPARENT";
    const noteOnly = transparent || (NOTE_ONLY.test(summary) && !BUSY.test(summary));
    const ex = new Set<string>();
    for (const x of ev.EXDATE ?? []) for (const v of x.value.split(",")) { const d = propDate({ params: x.params, value: v }); if (d) ex.add(d.date); }
    for (const occ of occurrences(cov.first, span, ev.RRULE?.[0]?.value, ex, start, end)) {
      const oFirst = occ, oLast = addDays(occ, span);
      for (let d = oFirst; d <= oLast; d = addDays(d, 1)) {
        if (noteOnly) { if (occupied.has(d)) holiday.add(d); continue; }
        if (!occupied.has(d)) {
          if (nights > 0 && d === end) turnover.add(d); // someone else arrives on our departure day
          continue;
        }
        // Their last marked day is our arrival day: likely a same-day changeover.
        if (nights > 0 && d === start && oLast === start && oFirst < start) turnover.add(d);
        else conflicts.add(d);
      }
    }
  }
  const sorted = (s: Set<string>) => [...s].sort();
  const status = conflicts.size ? "conflict" : turnover.size ? "possible_conflict" : "appears_available";
  const note = status === "conflict"
    ? "Some of those dates are already taken. Offer to check nearby dates."
    : status === "possible_conflict"
      ? "Another booking starts or ends on the edge of this stay. The owner must confirm the changeover."
      : "Looks open on the calendar. Not reserved until the owner confirms and the agreement is signed.";
  return { status, start_date: start, end_date: end, nights, conflicting_dates: sorted(conflicts), turnover_dates: sorted(turnover), holiday_rate_dates: sorted(holiday), note };
}
