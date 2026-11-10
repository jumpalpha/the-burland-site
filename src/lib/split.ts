export interface Household { name: string; adults: number; kids: number; nights: number }
export interface SplitResult { name: string; shares: number; amount: number }

// Splits a total by weighted head-nights. Kids count as `kidWeight` of an adult (0 = free, 0.5 = half).
export function splitCost(total: number, families: Household[], o: { mode: "family" | "head"; kidWeight: number; byNights: boolean }): SplitResult[] {
  const shares = families.map((f) => {
    const people = o.mode === "family" ? 1 : f.adults + f.kids * o.kidWeight;
    return Math.max(0, people * (o.byNights ? Math.max(0, f.nights) : 1));
  });
  const sum = shares.reduce((a, b) => a + b, 0);
  if (!sum || total <= 0) return families.map((f) => ({ name: f.name, shares: 0, amount: 0 }));
  const raw = shares.map((s) => (total * s) / sum);
  const rounded = raw.map((r) => Math.floor(r * 100) / 100);
  // Hand leftover cents to the largest remainders so the parts add up exactly to the total.
  let cents = Math.round((total - rounded.reduce((a, b) => a + b, 0)) * 100);
  const order = raw.map((r, i) => [r - rounded[i], i] as const).sort((a, b) => b[0] - a[0]);
  for (let k = 0; cents > 0 && order.length; k = (k + 1) % order.length, cents--) rounded[order[k][1]] += 0.01;
  return families.map((f, i) => ({ name: f.name, shares: shares[i], amount: Math.round(rounded[i] * 100) / 100 }));
}
