import { describe, expect, it } from "vitest";
import { splitCost } from "@/lib/split";
import { parseEvents } from "@/lib/availability";

const fams = [
  { name: "A", adults: 2, kids: 2, nights: 3 },
  { name: "B", adults: 2, kids: 0, nights: 3 },
  { name: "C", adults: 1, kids: 0, nights: 1 },
];

describe("cost splitter", () => {
  it("per family splits evenly and sums exactly", () => {
    const r = splitCost(1000, fams, { mode: "family", kidWeight: 0, byNights: false });
    expect(r.reduce((s, x) => s + x.amount, 0)).toBeCloseTo(1000, 2);
    expect(r.map((x) => x.amount).sort()).toEqual([333.33, 333.33, 333.34]);
  });
  it("per head with half-price kids and nights", () => {
    const r = splitCost(4500, fams, { mode: "head", kidWeight: 0.5, byNights: true });
    // shares: A=3*3=9, B=2*3=6, C=1*1=1 => 16
    expect(r[0].amount).toBeCloseTo(2531.25, 2);
    expect(r[1].amount).toBeCloseTo(1687.5, 2);
    expect(r[2].amount).toBeCloseTo(281.25, 2);
  });
  it("kids free", () => {
    const r = splitCost(100, [{ name: "A", adults: 0, kids: 3, nights: 1 }, { name: "B", adults: 1, kids: 0, nights: 1 }], { mode: "head", kidWeight: 0, byNights: false });
    expect(r[0].amount).toBe(0);
    expect(r[1].amount).toBe(100);
  });
});

describe("availability parsing", () => {
  it("all-day busy events block each night, end exclusive", () => {
    const a = parseEvents([{ allDay: true, start: "20270605", end: "20270608", kind: "busy" }]);
    expect([...a.busy]).toEqual(["2027-06-05", "2027-06-06", "2027-06-07"]);
  });
  it("note events become holiday nights", () => {
    const a = parseEvents([{ allDay: true, start: "20271225", end: "20271226", kind: "note" }]);
    expect(a.holidays.has("2027-12-25")).toBe(true);
    expect(a.busy.size).toBe(0);
  });
  it("timed events block their day", () => {
    const a = parseEvents([{ allDay: false, start: "20270310T140000", end: "20270310T200000", kind: "busy" }]);
    expect(a.busy.has("2027-03-10")).toBe(true);
  });
});
