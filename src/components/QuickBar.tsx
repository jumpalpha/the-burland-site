"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { addDays, todayLocal } from "@/lib/dates";
import { EVENT_TYPES } from "@/lib/site";

export function QuickBar() {
  const router = useRouter();
  const [today, setToday] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [type, setType] = useState<string>(EVENT_TYPES[0]);
  useEffect(() => setToday(todayLocal()), []);
  return (
    <form
      className="quickbar"
      onSubmit={(e) => {
        e.preventDefault();
        const p = new URLSearchParams({ type });
        if (start) p.set("start", start);
        if (end) p.set("end", end);
        router.push("/book?" + p.toString());
      }}
    >
      <label>
        Arrive
        <input type="date" value={start} min={today} onChange={(e) => { setStart(e.target.value); if (!end || end <= e.target.value) setEnd(addDays(e.target.value, 2)); }} />
      </label>
      <label>
        Depart
        <input type="date" value={end} min={start || today} onChange={(e) => setEnd(e.target.value)} />
      </label>
      <label>
        Occasion
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </label>
      <label>
        Guests
        <select defaultValue="20-40" name="guests" aria-label="Guests">
          <option>Under 20</option>
          <option>20-40</option>
          <option>40-100</option>
          <option>100+</option>
        </select>
      </label>
      <button className="btn btn-brass" type="submit">See price &amp; dates</button>
    </form>
  );
}
