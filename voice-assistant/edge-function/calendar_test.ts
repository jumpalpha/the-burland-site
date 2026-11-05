import { checkAvailability } from "./calendar.ts";

const now = new Date("2026-11-04T18:00:00Z");
const ev = (lines: string) => `BEGIN:VEVENT\n${lines.trim()}\nEND:VEVENT`;
const cal = (...evs: string[]) => `BEGIN:VCALENDAR\r\nVERSION:2.0\r\n${evs.join("\r\n")}\r\nEND:VCALENDAR\r\n`.replace(/\n(?!\r)/g, "\r\n").replace(/\r\r/g, "\r");

const ICS = cal(
  // Reserved Fri Jun 12 - Sun Jun 14, 2027 (all-day, DTEND exclusive)
  ev("DTSTART;VALUE=DATE:20270612\nDTEND;VALUE=DATE:20270615\nSUMMARY:Reserved"),
  // Single blocked day
  ev("DTSTART;VALUE=DATE:20270704\nDTEND;VALUE=DATE:20270705\nSUMMARY:Not Available"),
  // Holiday rate note (not a booking)
  ev("DTSTART;VALUE=DATE:20261126\nDTEND;VALUE=DATE:20261127\nSUMMARY:Holiday rate $1300"),
  // Cancelled booking
  ev("DTSTART;VALUE=DATE:20270801\nDTEND;VALUE=DATE:20270803\nSUMMARY:Reserved\nSTATUS:CANCELLED"),
  // Timed UTC event: 2027-03-10 02:00Z is Mar 9 evening in Denver
  ev("DTSTART:20270310T020000Z\nDTEND:20270310T050000Z\nSUMMARY:Private party"),
  // Yearly recurring block on Dec 24
  ev("DTSTART;VALUE=DATE:20251224\nDTEND;VALUE=DATE:20251225\nRRULE:FREQ=YEARLY\nSUMMARY:Closed"),
  // Folded line in a summary
  ev("DTSTART;VALUE=DATE:20270901\nDTEND;VALUE=DATE:20270903\nSUMMARY:Rese\n rved"),
);

const cases: [string, string, string, string, (r: any) => boolean][] = [
  ["open weekend", "2027-06-04", "2027-06-06", "appears_available", (r) => r.nights === 2],
  ["overlaps reservation", "2027-06-11", "2027-06-13", "conflict", (r) => r.conflicting_dates.join() === "2027-06-12"],
  ["multi-day inside reservation", "2027-06-12", "2027-06-15", "conflict", (r) => r.conflicting_dates.length === 3],
  ["depart on day they arrive", "2027-06-09", "2027-06-12", "possible_conflict", (r) => r.turnover_dates.join() === "2027-06-12"],
  ["arrive day after they leave", "2027-06-15", "2027-06-17", "appears_available", () => true],
  ["single-day event on blocked day", "2027-07-04", "2027-07-04", "conflict", () => true],
  ["single-day open", "2027-07-05", "2027-07-05", "appears_available", () => true],
  ["holiday note is not a booking", "2026-11-25", "2026-11-28", "appears_available", (r) => r.holiday_rate_dates.join() === "2026-11-26"],
  ["cancelled ignored", "2027-08-01", "2027-08-03", "appears_available", () => true],
  ["UTC event converted to Denver date", "2027-03-09", "2027-03-09", "conflict", () => true],
  ["UTC event not on next day", "2027-03-10", "2027-03-10", "appears_available", () => true],
  ["yearly recurrence expands", "2027-12-23", "2027-12-26", "conflict", (r) => r.conflicting_dates.join() === "2027-12-24"],
  ["folded summary parsed", "2027-09-01", "2027-09-02", "conflict", () => true],
  ["past date rejected", "2026-10-01", "2026-10-03", "invalid_dates", () => true],
  ["reversed dates rejected", "2027-06-06", "2027-06-04", "invalid_dates", () => true],
  ["bad format rejected", "June 4", "June 6", "invalid_dates", () => true],
  ["too long rejected", "2027-01-01", "2027-03-01", "invalid_dates", () => true],
];

let fail = 0;
for (const [name, s, e, want, extra] of cases) {
  const r = checkAvailability(ICS, s, e, now) as any;
  const ok = r.status === want && extra(r);
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  -> ${r.status}${ok ? "" : " " + JSON.stringify(r)}`);
}
// Privacy: output never contains event titles
const r = JSON.stringify(checkAvailability(ICS, "2027-03-09", "2027-03-10", now));
const leak = /party|reserved|closed/i.test(r.replace(/"note":"[^"]*"/, ""));
console.log(`${leak ? "FAIL" : "PASS"}  no event titles in output`);
if (leak) fail++;
console.log(fail ? `${fail} FAILED` : `all ${cases.length + 1} passed`);
if (fail) Deno.exit(1);

// Live Apps Script shape -> same logic (real bookings seen 2026-11-04)
import { liveToIcs } from "./calendar.ts";
const live = liveToIcs([
  { allDay: false, start: "20261218T150000", end: "20261220T110000", kind: "busy" },
  { allDay: true, start: "20270108", end: "20270109", kind: "busy" },
  { allDay: false, start: "20270527T150000", end: "20270530T103000", kind: "busy" },
  { allDay: true, start: "20261126", end: "20261127", kind: "note" },
  { allDay: true, start: "bad", end: "x", kind: "busy" },
]);
const liveCases: [string, string, string][] = [
  ["2026-12-18", "2026-12-20", "conflict"], ["2026-12-19", "2026-12-19", "conflict"],
  ["2026-12-20", "2026-12-22", "possible_conflict"], ["2026-12-16", "2026-12-18", "possible_conflict"],
  ["2026-12-21", "2026-12-23", "appears_available"], ["2027-01-08", "2027-01-08", "conflict"],
  ["2027-01-09", "2027-01-11", "appears_available"], ["2027-05-28", "2027-05-29", "conflict"],
  ["2027-05-24", "2027-05-26", "appears_available"], ["2027-05-30", "2027-06-01", "possible_conflict"],
  ["2026-11-25", "2026-11-28", "appears_available"],
];
let lf = 0;
for (const [s, e, want] of liveCases) {
  const r = checkAvailability(live, s, e, now) as any;
  const ok = r.status === want; if (!ok) lf++;
  console.log(`${ok ? "PASS" : "FAIL"}  live ${s}..${e} -> ${r.status}${ok ? "" : " want " + want}`);
}
console.log(lf ? `${lf} live FAILED` : `all ${liveCases.length} live passed`);
if (lf) Deno.exit(1);
