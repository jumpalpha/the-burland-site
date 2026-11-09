import { ADDONS, POLICY, RATES } from "./site";
import { addDays, diffDays, dow, month, nightsBetween, nthWeekday, type ISODate } from "./dates";

export type Season = "peak" | "off";
export type NightKind = "weeknight" | "weekend" | "holiday";
export type DecorKey = keyof typeof ADDONS.decor;

export interface Night { date: ISODate; season: Season; kind: NightKind; rate: number }
export interface LineItem { label: string; amount: number; note?: string }
export interface QuoteInput {
  mode: "overnight" | "hourly";
  start: ISODate;
  end?: ISODate; // check-out date (overnight)
  hours?: number; // hourly
  decor?: DecorKey;
  whiteTablecloths?: number;
  alcohol?: boolean;
  extraHolidays?: ISODate[]; // nights the calendar marks as holiday rate
  adjustments?: LineItem[]; // owner-only discounts or extras
}
export interface Quote {
  ok: boolean;
  problems: string[];
  notes: string[];
  nights: Night[];
  lines: LineItem[];
  total: number;
  dueAtBooking: number;
  balance: number;
  balanceDue: ISODate | null;
  securityDeposit: number;
  depositRefund: number;
}

export const seasonOf = (d: ISODate): Season => (RATES.peakMonths.includes(month(d)) ? "peak" : "off");
export const isWeekendNight = (d: ISODate) => [5, 6, 0].includes(dow(d)); // Fri, Sat, Sun nights

// Off-season holiday nights. [CONFIRM WITH OWNER] The pricing page lists a holiday rate but not which days.
export function holidayNights(year: number): ISODate[] {
  const thanksgiving = nthWeekday(year, 11, 4, 4);
  return [
    `${year}-01-01`,
    addDays(thanksgiving, -1),
    thanksgiving,
    `${year}-12-24`,
    `${year}-12-25`,
    `${year}-12-31`,
  ];
}

export function nightInfo(d: ISODate, extraHolidays: ISODate[] = []): Night {
  const season = seasonOf(d);
  const y = Number(d.slice(0, 4));
  if (season === "peak") {
    const kind: NightKind = isWeekendNight(d) ? "weekend" : "weeknight";
    return { date: d, season, kind, rate: RATES.peak[kind] };
  }
  if (holidayNights(y).includes(d) || extraHolidays.includes(d)) return { date: d, season, kind: "holiday", rate: RATES.off.holiday };
  const kind: NightKind = isWeekendNight(d) ? "weekend" : "weeknight";
  return { date: d, season, kind, rate: RATES.off[kind] };
}

export function minNightsFor(nights: Night[]): number {
  let min = 1;
  for (const n of nights) {
    if (n.season === "peak") min = Math.max(min, RATES.minNights.peak);
    else if (n.kind === "holiday") min = Math.max(min, RATES.minNights.offHoliday);
    else if (n.kind === "weekend") min = Math.max(min, RATES.minNights.offWeekend);
  }
  return min;
}

export const hourlyPrice = (hours: number) =>
  hours <= 0 ? 0 : RATES.hourly.first + RATES.hourly.additional * (Math.ceil(hours) - 1);

export function hourlyAllowed(d: ISODate): boolean {
  return seasonOf(d) === "off" && !isWeekendNight(d) && !holidayNights(Number(d.slice(0, 4))).includes(d);
}

export function quote(q: QuoteInput, today?: ISODate): Quote {
  const problems: string[] = [];
  const notes: string[] = [];
  const lines: LineItem[] = [];
  let nights: Night[] = [];

  if (q.mode === "overnight") {
    const end = q.end ?? q.start;
    const n = diffDays(q.start, end);
    if (n < 1) problems.push("Choose a check-out date after your arrival date.");
    else if (n > RATES.maxNights) problems.push(`Stays are limited to ${RATES.maxNights} nights online. Call us for longer stays.`);
    else {
      nights = nightsBetween(q.start, end).map((d) => nightInfo(d, q.extraHolidays));
      const min = minNightsFor(nights);
      if (n < min) {
        const why = nights.some((x) => x.season === "peak")
          ? "Peak season (May through September) stays"
          : nights.some((x) => x.kind === "holiday")
            ? "Holiday stays"
            : "Off-season weekend stays (Friday through Sunday nights)";
        problems.push(`${why} have a ${min}-night minimum.`);
      }
      const groups = new Map<string, { count: number; rate: number }>();
      for (const x of nights) {
        const label = `${x.season === "peak" ? "Peak" : "Off-season"} ${x.kind === "holiday" ? "holiday night" : x.kind === "weekend" ? "weekend night" : "weeknight"}`;
        const g = groups.get(label) ?? { count: 0, rate: x.rate };
        g.count++;
        groups.set(label, g);
      }
      for (const [label, g] of groups) {
        lines.push({ label: `${label}${g.count > 1 ? "s" : ""} (${g.count} x $${g.rate.toLocaleString("en-US")})`, amount: g.count * g.rate });
      }
      if (nights.some((x) => x.kind === "holiday")) notes.push("Holiday rates are confirmed by the owner for your exact dates.");
    }
  } else {
    const h = Math.ceil(q.hours ?? 0);
    if (!hourlyAllowed(q.start)) problems.push("Hourly rentals are available Monday through Thursday, October through April.");
    if (h < 1) problems.push("Choose how many hours you need.");
    if (h > 12) problems.push("For more than 12 hours, an overnight stay is usually the better value.");
    if (h >= 1) lines.push({ label: `Hourly rental (${h} hour${h > 1 ? "s" : ""})`, amount: hourlyPrice(h) });
  }

  const decor = ADDONS.decor[q.decor ?? "none"];
  if (decor.price) lines.push({ label: decor.label, amount: decor.price });
  if (q.whiteTablecloths && q.whiteTablecloths > 0)
    lines.push({ label: `White tablecloths (${q.whiteTablecloths} x $${ADDONS.whiteTablecloth})`, amount: q.whiteTablecloths * ADDONS.whiteTablecloth });
  if (q.alcohol) lines.push({ label: "Alcohol fee", amount: ADDONS.alcohol });
  for (const a of q.adjustments ?? []) if (a.amount) lines.push(a);

  const total = Math.max(0, lines.reduce((s, l) => s + l.amount, 0));
  const dueAtBooking = Math.round(total * POLICY.bookingPercent);
  let balanceDue: ISODate | null = addDays(q.start, -POLICY.balanceDaysBefore);
  if (today && balanceDue <= today) {
    notes.push(`Your arrival is less than ${POLICY.balanceDaysBefore} days away, so the full balance may be due when you sign. The owner will confirm.`);
    balanceDue = null;
  }
  return {
    ok: problems.length === 0 && total > 0,
    problems,
    notes,
    nights,
    lines,
    total,
    dueAtBooking,
    balance: total - dueAtBooking,
    balanceDue,
    securityDeposit: POLICY.securityDeposit,
    depositRefund: POLICY.securityDeposit - POLICY.cleaningFee,
  };
}

export function quoteText(q: Quote, o: { start: ISODate; end?: ISODate; name?: string }): string {
  const rows = q.lines.map((l) => `- ${l.label}: $${l.amount.toLocaleString("en-US")}`);
  return [
    `Estimate for ${o.name ? o.name + ", " : ""}${o.start}${o.end && o.end !== o.start ? " to " + o.end : ""}`,
    ...rows,
    `Estimated total: $${q.total.toLocaleString("en-US")}`,
    `Due at booking (50%): $${q.dueAtBooking.toLocaleString("en-US")}`,
    q.balanceDue ? `Balance $${q.balance.toLocaleString("en-US")} due by ${q.balanceDue}` : `Balance: $${q.balance.toLocaleString("en-US")}`,
    `Refundable security deposit: $${q.securityDeposit.toLocaleString("en-US")} ($${q.depositRefund.toLocaleString("en-US")} back after the $${POLICY.cleaningFee} cleaning fee if there's no damage)`,
    ...q.notes,
  ].join("\n");
}
