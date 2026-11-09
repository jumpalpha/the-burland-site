"use client";
import { copyText, useStored } from "@/lib/useStored";

interface Meal { day: string; meal: string; family: string; menu: string }
interface S { families: string; meals: Meal[]; allergies: string }

const init: S = {
  families: "Family 1\nFamily 2\nFamily 3",
  allergies: "",
  meals: [
    { day: "Friday", meal: "Dinner", family: "", menu: "" },
    { day: "Saturday", meal: "Breakfast", family: "", menu: "" },
    { day: "Saturday", meal: "Lunch (packed for the day trip)", family: "", menu: "" },
    { day: "Saturday", meal: "Big dinner in the ballroom", family: "", menu: "" },
    { day: "Sunday", meal: "Brunch", family: "", menu: "" },
  ],
};

export function MealPlanner() {
  const [s, setS] = useStored<S>("burland-meals", init);
  const fams = s.families.split("\n").map((x) => x.trim()).filter(Boolean);
  const upd = (i: number, k: keyof Meal, v: string) => setS({ ...s, meals: s.meals.map((m, j) => (j === i ? { ...m, [k]: v } : m)) });
  const autoAssign = () => fams.length && setS({ ...s, meals: s.meals.map((m, i) => ({ ...m, family: fams[i % fams.length] })) });
  const text = [
    "Burland reunion meal schedule",
    ...s.meals.map((m) => `${m.day} ${m.meal}: ${m.family || "(open)"}${m.menu ? ` - ${m.menu}` : ""}`),
    s.allergies ? `\nAllergies and diet needs: ${s.allergies}` : "",
  ].join("\n");

  return (
    <div className="grid" style={{ gap: 22 }}>
      <div className="grid g2">
        <label className="field panel"><span>Households (one per line)</span><textarea value={s.families} onChange={(e) => setS({ ...s, families: e.target.value })} /></label>
        <label className="field panel"><span>Allergies and dietary needs</span><textarea value={s.allergies} placeholder="e.g. Uncle Ray: no nuts. Maddie: gluten free." onChange={(e) => setS({ ...s, allergies: e.target.value })} /></label>
      </div>
      <div className="table-wrap">
        <table className="mini-table">
          <thead><tr><th>Day</th><th>Meal</th><th>Who cooks</th><th>Menu</th><th><span className="sr-only">Remove</span></th></tr></thead>
          <tbody>
            {s.meals.map((m, i) => (
              <tr key={i}>
                <td><input className="input" aria-label="Day" value={m.day} onChange={(e) => upd(i, "day", e.target.value)} style={{ width: 110 }} /></td>
                <td><input className="input" aria-label="Meal" value={m.meal} onChange={(e) => upd(i, "meal", e.target.value)} /></td>
                <td>
                  <select className="input" aria-label="Who cooks" value={m.family} onChange={(e) => upd(i, "family", e.target.value)}>
                    <option value="">Open</option>
                    {fams.map((f) => <option key={f}>{f}</option>)}
                  </select>
                </td>
                <td><input className="input" aria-label="Menu" value={m.menu} placeholder="Tacos, salad..." onChange={(e) => upd(i, "menu", e.target.value)} /></td>
                <td><button type="button" className="x-btn" aria-label="Remove meal" onClick={() => setS({ ...s, meals: s.meals.filter((_, j) => j !== i) })}>&times;</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row no-print">
        <button type="button" className="btn btn-line btn-sm" onClick={() => setS({ ...s, meals: [...s.meals, { day: "", meal: "", family: "", menu: "" }] })}>Add a meal</button>
        <button type="button" className="btn btn-line btn-sm" onClick={autoAssign}>Rotate households automatically</button>
        <button type="button" className="btn btn-dark btn-sm" onClick={() => copyText(text)}>Copy schedule</button>
        <button type="button" className="btn btn-line btn-sm" onClick={() => window.print()}>Print sign-up sheet</button>
      </div>
      <p className="small muted">Saved on this device only. The Burland kitchen is set up for big-group cooking; bring your own groceries.</p>
    </div>
  );
}
