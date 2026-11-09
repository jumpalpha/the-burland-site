"use client";
import { useStored } from "@/lib/useStored";

const LISTS: Record<string, string[]> = {
  "For everyone": ["Pillows and towels (if your group agreed to bring them)", "Phone chargers and a power strip", "Comfortable shoes for the dunes and boardwalks", "Layers. Mornings are cool even in July", "Sunscreen, hats, and water bottles", "Any medications"],
  "For the kitchen": ["Groceries for your assigned meals", "Coolers for day trips", "Zip bags and foil for leftovers", "Favorite family recipes", "Birthday candles, if anyone's celebrating"],
  "For the kids": ["Swimsuits for the Sand Bar or Egin Lakes", "Sleds or sandboards for the dunes", "Pajamas for movie night", "A few favorite board games", "Glow sticks for game night"],
  "For the memories": ["Five old family photos for the slideshow", "A family tree poster and markers", "Questions for interviewing the grandparents", "Keepsakes for each household"],
  "Winter trips": ["Snow boots and gloves", "Tire chains or snow tires for mountain passes", "Hand warmers", "Hot cocoa supplies"],
};

export function Packing() {
  const [done, setDone] = useStored<string[]>("burland-packing", []);
  const toggle = (k: string) => setDone(done.includes(k) ? done.filter((x) => x !== k) : [...done, k]);
  return (
    <div className="grid" style={{ gap: 22 }}>
      <div className="grid g2">
        {Object.entries(LISTS).map(([h, items]) => (
          <div key={h} className="panel">
            <h3>{h}</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
              {items.map((i) => {
                const k = h + ":" + i;
                return <li key={k}><label className="tick"><input type="checkbox" checked={done.includes(k)} onChange={() => toggle(k)} />{i}</label></li>;
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="row no-print">
        <button type="button" className="btn btn-dark btn-sm" onClick={() => window.print()}>Print list</button>
        <button type="button" className="btn btn-line btn-sm" onClick={() => setDone([])}>Uncheck all</button>
      </div>
    </div>
  );
}
