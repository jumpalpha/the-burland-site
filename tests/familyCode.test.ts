import { describe, expect, it } from "vitest";
import { formatCode, isEasyToGuess, isValidCode, normalizeCode } from "../src/lib/familyCode";

describe("family codes", () => {
  it("normalizes case, spaces and dashes", () => {
    expect(normalizeCode(" k7qm-r2xd ")).toBe("K7QMR2XD");
    expect(formatCode("k7qmr2xd")).toBe("K7QM-R2XD");
  });
  it("accepts 6 to 12 letters and numbers, ignoring dashes and spaces", () => {
    expect(isValidCode("K7QM-R2XD")).toBe(true);
    expect(isValidCode("dopp reunion")).toBe(true);
    expect(isValidCode("DOPP")).toBe(false);
    expect(isValidCode("DOPPREUNION2027")).toBe(false);
    expect(formatCode("dopp-reunion")).toBe("DOPPREUNION");
  });
  it("flags codes that are easy to guess", () => {
    expect(isEasyToGuess("SMITHS")).toBe(true);
    expect(isEasyToGuess("DOPPFAMILY")).toBe(true);
    expect(isEasyToGuess("DOPP-2027")).toBe(false);
  });
});
