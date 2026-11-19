import { describe, expect, it } from "vitest";
import { formatCode, isValidCode, normalizeCode } from "../src/lib/familyCode";

describe("family codes", () => {
  it("normalizes case, spaces and dashes", () => {
    expect(normalizeCode(" k7qm-r2xd ")).toBe("K7QMR2XD");
    expect(formatCode("k7qmr2xd")).toBe("K7QM-R2XD");
  });
  it("rejects look-alike characters and wrong lengths", () => {
    expect(isValidCode("K7QM-R2XD")).toBe(true);
    expect(isValidCode("K7QM-R2X0")).toBe(false);
    expect(isValidCode("K7QM")).toBe(false);
  });
});
