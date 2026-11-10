// Dates are plain "YYYY-MM-DD" strings handled in UTC, so a stay never shifts a day with the viewer's time zone.

export type ISODate = string;

export const toISO = (d: Date): ISODate => d.toISOString().slice(0, 10);
export const parseISO = (s: ISODate): Date => new Date(s + "T00:00:00Z");
export const isISO = (s: unknown): s is ISODate => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(parseISO(s).getTime());

export function addDays(s: ISODate, n: number): ISODate {
  const d = parseISO(s);
  d.setUTCDate(d.getUTCDate() + n);
  return toISO(d);
}

export const diffDays = (a: ISODate, b: ISODate) => Math.round((parseISO(b).getTime() - parseISO(a).getTime()) / 86400000);
export const dow = (s: ISODate) => parseISO(s).getUTCDay();
export const month = (s: ISODate) => parseISO(s).getUTCMonth() + 1;

export function todayLocal(): ISODate {
  const t = new Date();
  return new Date(t.getTime() - t.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function nightsBetween(start: ISODate, end: ISODate): ISODate[] {
  const out: ISODate[] = [];
  for (let d = start; d < end; d = addDays(d, 1)) out.push(d);
  return out;
}

const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const dayName = (s: ISODate) => DAY[dow(s)];
export const monthName = (m: number) => MON[m - 1];
export function fmtDate(s: ISODate, opts: { weekday?: boolean; year?: boolean } = {}): string {
  const d = parseISO(s);
  const core = `${MON[d.getUTCMonth()].slice(0, 3)} ${d.getUTCDate()}`;
  return `${opts.weekday ? DAY[d.getUTCDay()].slice(0, 3) + ", " : ""}${core}${opts.year === false ? "" : ", " + d.getUTCFullYear()}`;
}

// nth weekday of a month, e.g. Thanksgiving = 4th Thursday of November.
export function nthWeekday(year: number, monthNum: number, weekday: number, n: number): ISODate {
  const first = new Date(Date.UTC(year, monthNum - 1, 1));
  const offset = (weekday - first.getUTCDay() + 7) % 7;
  return toISO(new Date(Date.UTC(year, monthNum - 1, 1 + offset + (n - 1) * 7)));
}

// Builds a downloadable calendar file for one all-day range.
export function icsFile(o: { title: string; start: ISODate; endExclusive: ISODate; description: string }): string {
  const c = (s: ISODate) => s.replace(/-/g, "");
  const esc = (s: string) => s.replace(/[\\;,]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The Burland//theburland.com//EN",
    "BEGIN:VEVENT",
    `UID:${c(o.start)}-${Math.random().toString(36).slice(2)}@theburland.com`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART;VALUE=DATE:${c(o.start)}`,
    `DTEND;VALUE=DATE:${c(o.endExclusive)}`,
    `SUMMARY:${esc(o.title)}`,
    `DESCRIPTION:${esc(o.description)}`,
    "LOCATION:The Burland\\, St. Anthony\\, Idaho",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
