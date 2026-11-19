"use client";
import { useState } from "react";
import { useStored } from "@/lib/useStored";
import { useFamilyPlan } from "@/lib/useFamilyPlan";
import { FamilyCodePanel } from "./FamilyCodePanel";

const SUGGESTED: Record<string, string[]> = {
  "For everyone": ["Pillows and towels (if your group agreed to bring them)", "Phone chargers and a power strip", "Comfortable shoes for the dunes and boardwalks", "Layers. Mornings are cool even in July", "Sunscreen, hats, and water bottles", "Any medications"],
  "For the kitchen": ["Groceries for your assigned meals", "Coolers for day trips", "Zip bags and foil for leftovers", "Favorite family recipes", "Birthday candles, if anyone's celebrating"],
  "For the kids": ["Swimsuits for the Sand Bar or Egin Lakes", "Sleds or sandboards for the dunes", "Pajamas for movie night", "A few favorite board games", "Glow sticks for game night"],
  "For the memories": ["Five old family photos for the slideshow", "A family tree poster and markers", "Questions for interviewing the grandparents", "Keepsakes for each household"],
  "Winter trips": ["Snow boots and gloves", "Tire chains or snow tires for mountain passes", "Hand warmers", "Hot cocoa supplies"],
};

interface Item { id: string; text: string }
interface List { id: string; title: string; items: Item[] }
interface S { lists: List[] }

const newId = () => Math.random().toString(36).slice(2, 10);
const suggested = (): S => ({
  lists: Object.entries(SUGGESTED).map(([title, items]) => ({ id: newId(), title, items: items.map((text) => ({ id: newId(), text })) })),
});
const init = suggested();

export function Packing() {
  const [s, setS, , family] = useFamilyPlan<S>("packing", "burland-packing-list", init);
  const [done, setDone] = useStored<string[]>("burland-packing-checked", []); // check marks stay on this device
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [newList, setNewList] = useState("");
  const toggle = (k: string) => setDone(done.includes(k) ? done.filter((x) => x !== k) : [...done, k]);
  const edit = (lid: string, f: (l: List) => List) => setS({ lists: s.lists.map((l) => (l.id === lid ? f(l) : l)) });

  const addItem = (lid: string) => {
    const text = (drafts[lid] || "").trim();
    if (!text) return;
    edit(lid, (l) => ({ ...l, items: [...l.items, { id: newId(), text }] }));
    setDrafts({ ...drafts, [lid]: "" });
  };
  const removeList = (l: List) => {
    if (l.items.length && !confirm(`Remove "${l.title}" and its ${l.items.length} items?`)) return;
    setS({ lists: s.lists.filter((x) => x.id !== l.id) });
  };
  const addList = () => {
    const title = newList.trim();
    if (!title) return;
    setS({ lists: [...s.lists, { id: newId(), title, items: [] }] });
    setNewList("");
  };
  const restore = () => {
    const have = new Set(s.lists.flatMap((l) => l.items.map((i) => `${l.title}|${i.text}`)));
    const lists = [...s.lists];
    for (const [title, items] of Object.entries(SUGGESTED)) {
      let l = lists.find((x) => x.title === title);
      if (!l) { l = { id: newId(), title, items: [] }; lists.push(l); }
      const missing = items.filter((t) => !have.has(`${title}|${t}`)).map((text) => ({ id: newId(), text }));
      if (missing.length) lists[lists.indexOf(l)] = { ...l, items: [...l.items, ...missing] };
    }
    setS({ lists });
  };

  return (
    <div className="grid" style={{ gap: 22 }}>
      <FamilyCodePanel family={family} current="/plan/packing" />
      <div className="grid g2">
        {s.lists.map((l) => (
          <div key={l.id} className="panel">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input className="input" aria-label="List name" value={l.title} onChange={(e) => edit(l.id, (x) => ({ ...x, title: e.target.value }))} style={{ fontFamily: "var(--display)", fontSize: "1.2rem", flex: 1 }} />
              <button type="button" className="x-btn no-print" aria-label={`Remove list ${l.title}`} onClick={() => removeList(l)}>&times;</button>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "12px 0", display: "grid", gap: 8 }}>
              {l.items.map((i) => (
                <li key={i.id} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <label className="tick"><input type="checkbox" checked={done.includes(i.id)} onChange={() => toggle(i.id)} />{i.text}</label>
                  <button type="button" className="x-btn no-print" aria-label={`Remove ${i.text}`} onClick={() => edit(l.id, (x) => ({ ...x, items: x.items.filter((y) => y.id !== i.id) }))}>&times;</button>
                </li>
              ))}
            </ul>
            <form className="row no-print" style={{ gap: 8, flexWrap: "nowrap" }} onSubmit={(e) => { e.preventDefault(); addItem(l.id); }}>
              <input className="input" aria-label={`Add to ${l.title}`} placeholder="Add an item..." value={drafts[l.id] || ""} onChange={(e) => setDrafts({ ...drafts, [l.id]: e.target.value })} />
              <button type="submit" className="btn btn-line btn-sm" disabled={!(drafts[l.id] || "").trim()}>Add</button>
            </form>
          </div>
        ))}
      </div>
      <form className="row no-print" style={{ gap: 8 }} onSubmit={(e) => { e.preventDefault(); addList(); }}>
        <input className="input" aria-label="New list name" placeholder="New list, e.g. For the talent show" value={newList} onChange={(e) => setNewList(e.target.value)} style={{ maxWidth: 320 }} />
        <button type="submit" className="btn btn-line btn-sm" disabled={!newList.trim()}>Add a list</button>
      </form>
      <div className="row no-print">
        <button type="button" className="btn btn-dark btn-sm" onClick={() => window.print()}>Print list</button>
        <button type="button" className="btn btn-line btn-sm" onClick={() => setDone([])}>Uncheck all</button>
        <button type="button" className="btn btn-line btn-sm" onClick={restore}>Restore suggested items</button>
      </div>
      <p className="small muted">{family.code ? "The list is shared with everyone who has your family code. Check marks stay on your own device, so each household tracks its own packing." : "Saved on this device only until you create a family code."}</p>
    </div>
  );
}
