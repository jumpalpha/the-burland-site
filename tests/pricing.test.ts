import { describe, expect, it } from "vitest";
import { quote, nightInfo, hourlyPrice, hourlyAllowed, holidayNights } from "@/lib/pricing";
import { pageToken } from "@/lib/forms";
import { addDays, nthWeekday, icsFile } from "@/lib/dates";

// 2027-06-07 is a Monday (peak). 2027-01-11 is a Monday (off-season).
const PEAK_MON = "2027-06-07";
const OFF_MON = "2027-01-11";
const total = (start: string, nights: number) => quote({ mode: "overnight", start, end: addDays(start, nights) }).total;

describe("published pricing page examples (peak season)", () => {
  it("2 weeknights = $2,400", () => expect(total(PEAK_MON, 2)).toBe(2400));
  it("2 weekend nights (Fri, Sat) = $3,000", () => expect(total(addDays(PEAK_MON, 4), 2)).toBe(3000));
  it("Mon, Tue, Wed = $3,600", () => expect(total(PEAK_MON, 3)).toBe(3600));
  it("Fri, Sat, Sun = $4,500", () => expect(total(addDays(PEAK_MON, 4), 3)).toBe(4500));
  it("Mon to Thu, 4 nights = $4,800", () => expect(total(PEAK_MON, 4)).toBe(4800));
  it("Thu + Fri = $2,700", () => expect(total(addDays(PEAK_MON, 3), 2)).toBe(2700));
  it("Thu to Sun, 4 nights = $5,700 (confirmed by owner)", () =>
    expect(total(addDays(PEAK_MON, 3), 4)).toBe(5700));
});

describe("rules", () => {
  it("off-season weeknight $800, weekend $1,000", () => {
    expect(nightInfo(OFF_MON).rate).toBe(800);
    expect(nightInfo(addDays(OFF_MON, 4)).rate).toBe(1000);
  });
  it("Sunday night is a weekend night", () => expect(nightInfo("2027-01-17").kind).toBe("weekend"));
  it("one off-season weeknight has no minimum", () => expect(quote({ mode: "overnight", start: OFF_MON, end: addDays(OFF_MON, 1) }).ok).toBe(true));
  it("one off-season Friday night breaks the 2-night minimum", () => {
    const q = quote({ mode: "overnight", start: addDays(OFF_MON, 4), end: addDays(OFF_MON, 5) });
    expect(q.ok).toBe(false);
    expect(q.problems[0]).toMatch(/2-night/);
  });
  it("one peak weeknight breaks the 2-night minimum", () => expect(quote({ mode: "overnight", start: PEAK_MON, end: addDays(PEAK_MON, 1) }).ok).toBe(false));
  it("holiday nights cost $1,300 with a 3-night minimum", () => {
    const q = quote({ mode: "overnight", start: "2027-12-24", end: "2027-12-26" });
    expect(q.total).toBe(2600);
    expect(q.problems[0]).toMatch(/3-night/);
  });
  it("Thanksgiving is the 4th Thursday of November", () => {
    expect(nthWeekday(2026, 11, 4, 4)).toBe("2026-11-26");
    expect(holidayNights(2027)).toContain("2027-11-25");
  });
  it("more than 14 nights is refused", () => expect(quote({ mode: "overnight", start: OFF_MON, end: addDays(OFF_MON, 15) }).ok).toBe(false));
  it("hourly: $200 first hour, $75 after", () => {
    expect(hourlyPrice(1)).toBe(200);
    expect(hourlyPrice(4)).toBe(425);
    expect(hourlyPrice(2.5)).toBe(350);
  });
  it("hourly any off-season day except holidays", () => {
    expect(hourlyAllowed(OFF_MON)).toBe(true);
    expect(hourlyAllowed(addDays(OFF_MON, 4))).toBe(true);
    expect(hourlyAllowed(addDays(OFF_MON, 5))).toBe(true);
    expect(hourlyAllowed("2026-12-25")).toBe(false);
    expect(hourlyAllowed(PEAK_MON)).toBe(false);
  });
  it("add-ons and payment schedule", () => {
    const q = quote({ mode: "overnight", start: PEAK_MON, end: addDays(PEAK_MON, 2), decor: "deluxe", whiteTablecloths: 3, alcohol: true }, "2026-11-08");
    expect(q.total).toBe(2400 + 500 + 30 + 200);
    expect(q.dueAtBooking).toBe(1565);
    expect(q.balance).toBe(1565);
    expect(q.balanceDue).toBe("2027-03-09");
    expect(q.depositRefund).toBe(750);
  });
  it("arrival within 90 days drops the balance date and adds a note", () => {
    const q = quote({ mode: "overnight", start: "2026-12-01", end: "2026-12-02" }, "2026-11-08");
    expect(q.balanceDue).toBeNull();
    expect(q.notes.join(" ")).toMatch(/full balance/);
  });
});

describe("helpers", () => {
  it("page token matches the Apps Script formula", () => expect(pageToken(1700000000123)).toBe((1700000000 * 7 + 1912).toString(36)));
  it("ics file has all-day dates", () => {
    const s = icsFile({ title: "Burland request", start: "2027-06-07", endExclusive: "2027-06-09", description: "a, b" });
    expect(s).toContain("DTSTART;VALUE=DATE:20270607");
    expect(s).toContain("DESCRIPTION:a\\, b");
  });
});
