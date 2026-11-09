import { SITE } from "./site";
import { addDays, type ISODate } from "./dates";

export interface Availability { live: boolean; busy: Set<ISODate>; holidays: Set<ISODate> }

const ymd = (s: string) => `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;

// Reads the same shape the Burland Voice Calendar Apps Script returns: {ok, events:[{allDay,start,end,kind}]}.
// Busy dates are nights that can't be booked. "note" events (holiday-rate notes) mark holiday nights.
export function parseEvents(events: { allDay: boolean; start: string; end: string; kind: string }[]): Omit<Availability, "live"> {
  const busy = new Set<ISODate>(), holidays = new Set<ISODate>();
  for (const ev of events) {
    const start = ymd(ev.start);
    let end = ymd(ev.end);
    if (!ev.allDay) end = ev.end.slice(9, 13) > "0000" ? addDays(end, 1) : end;
    const target = ev.kind === "note" ? holidays : busy;
    for (let d = start; d < end; d = addDays(d, 1)) target.add(d);
    if (start === end) target.add(start);
  }
  return { busy, holidays };
}

export async function loadAvailability(from: ISODate, to: ISODate): Promise<Availability> {
  if (!SITE.availabilityEndpoint) return { live: false, busy: new Set(), holidays: new Set() };
  try {
    const r = await fetch(`${SITE.availabilityEndpoint}${SITE.availabilityEndpoint.includes("?") ? "&" : "?"}from=${from}&to=${to}`);
    const j = await r.json();
    if (!j.ok || !Array.isArray(j.events)) throw new Error("bad");
    return { live: true, ...parseEvents(j.events) };
  } catch {
    return { live: false, busy: new Set(), holidays: new Set() };
  }
}
