"use client";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LMap, Marker } from "leaflet";
import { CATS, PLACES, SEASONS, SHOW_DRIVE, type Cat, type Place } from "@/lib/basecamp";
import { SITE } from "@/lib/site";

const HOME: [number, number] = [SITE.geo.lat, SITE.geo.lng];
const FIRST = 10;
type SeasonPick = "all" | "summer" | "winter";

const fits = (p: Place, cat: Cat | "all", season: SeasonPick) =>
  (cat === "all" || p.cat === cat) && (season === "all" || p.season === "year" || p.season === season);

export function Explorer() {
  const [cat, setCat] = useState<Cat | "all">("all");
  const [season, setSeason] = useState<SeasonPick>("all");
  const [all, setAll] = useState(false);
  const mapEl = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const markers = useRef<Record<string, Marker>>({});

  const shown = useMemo(() => PLACES.filter((p) => fits(p, cat, season)).sort((a, b) => a.miles - b.miles), [cat, season]);
  const list = all ? shown : shown.slice(0, FIRST);

  // Build the map once, after load (Leaflet needs the browser).
  useEffect(() => {
    let dead = false;
    import("leaflet").then((L) => {
      if (dead || !mapEl.current || map.current) return;
      const m = L.map(mapEl.current, { scrollWheelZoom: false }).setView(HOME, 7);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 13,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(m);
      [50, 100, 150].forEach((mi) => {
        L.circle(HOME, { radius: mi * 1609.34, color: "#b8893e", weight: 1.5, dashArray: "5 6", fill: false, interactive: false }).addTo(m);
        L.marker([HOME[0] + mi / 69, HOME[1]], { interactive: false, icon: L.divIcon({ className: "", html: `<div class="bc-ring">${mi} mi</div>`, iconSize: [48, 18], iconAnchor: [24, 9] }) }).addTo(m);
      });
      L.marker(HOME, { icon: L.divIcon({ className: "", html: '<div class="bc-home">B</div>', iconSize: [24, 24], iconAnchor: [12, 12] }), zIndexOffset: 1000, title: SITE.name })
        .bindPopup(`<strong>${SITE.name}</strong><br>Downtown St. Anthony`)
        .addTo(m);
      PLACES.forEach((p) => {
        const icon = L.divIcon({ className: "", html: `<div class="bc-pin" style="background:${CATS[p.cat].color}"></div>`, iconSize: [14, 14], iconAnchor: [7, 7] });
        const pop = document.createElement("div");
        const b = document.createElement("strong");
        b.textContent = p.name;
        pop.appendChild(b);
        if (SHOW_DRIVE) pop.appendChild(document.createTextNode(` · about ${p.drive}`));
        const a = document.createElement("a");
        a.href = `#place-${p.id}`;
        a.textContent = "Details";
        a.style.display = "block";
        pop.appendChild(a);
        markers.current[p.id] = L.marker([p.lat, p.lng], { icon, title: p.name }).bindPopup(pop);
      });
      map.current = m;
      sync();
    });
    return () => {
      dead = true;
      map.current?.remove();
      map.current = null;
      markers.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sync() {
    const m = map.current;
    if (!m) return;
    PLACES.forEach((p) => {
      const mk = markers.current[p.id];
      if (!mk) return;
      if (fits(p, cat, season)) mk.addTo(m);
      else mk.remove();
    });
  }
  useEffect(sync, [cat, season]); // eslint-disable-line react-hooks/exhaustive-deps

  // "📍" buttons in the podcast section jump here and open the place.
  useEffect(() => {
    const on = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      setCat("all");
      setSeason("all");
      setAll(true);
      const p = PLACES.find((x) => x.id === id);
      if (p && map.current) {
        map.current.setView([p.lat, p.lng], 9);
        markers.current[id]?.addTo(map.current).openPopup();
      }
    };
    window.addEventListener("basecamp:focus", on);
    return () => window.removeEventListener("basecamp:focus", on);
  }, []);

  return (
    <>
      <div className="filters" role="group" aria-label="Category">
        <button type="button" className={"btn btn-sm " + (cat === "all" ? "btn-dark" : "btn-line")} aria-pressed={cat === "all"} onClick={() => setCat("all")}>Everything</button>
        {(Object.keys(CATS) as Cat[]).map((c) => (
          <button key={c} type="button" className={"btn btn-sm " + (cat === c ? "btn-dark" : "btn-line")} aria-pressed={cat === c} onClick={() => setCat(c)}>
            <span className="bc-dot" style={{ background: CATS[c].color }} aria-hidden="true" />
            {CATS[c].label}
          </button>
        ))}
      </div>
      <div className="bc-season" role="group" aria-label="Season">
        <span>Visiting in:</span>
        {(["all", "summer", "winter"] as SeasonPick[]).map((s) => (
          <button key={s} type="button" aria-pressed={season === s} onClick={() => setSeason(s)}>
            {s === "all" ? "Any season" : SEASONS[s]}
          </button>
        ))}
      </div>
      <div ref={mapEl} className="bc-map" role="region" aria-label="Map of places near The Burland" />
      <p className="small muted" style={{ marginTop: 10 }}>Rings show 50, 100, and 150 miles from The Burland. Places are listed closest first. Check road and park conditions before you go, especially in winter.</p>
      <p className="small" style={{ margin: "18px 0 12px", fontWeight: 600 }} aria-live="polite">
        Showing {list.length} of {shown.length} places
      </p>
      <div className="grid g3 bc-list">
        {list.map((p) => (
          <article key={p.id} id={`place-${p.id}`} className="card bc-card" style={{ ["--c" as string]: CATS[p.cat].color }}>
            <h3>{p.name}</h3>
            {SHOW_DRIVE && <div className="small muted">About {p.drive}</div>}
            <p>{p.blurb}</p>
            <div className="row" style={{ gap: 6 }}>
              {p.gem && <span className="chip bc-gem">Local favorite</span>}
              <span className="chip">{CATS[p.cat].label}</span>
              <span className="chip">{SEASONS[p.season]}</span>
            </div>
            {p.area && (
              <p className="small" style={{ margin: "12px 0 0" }}>
                <Link href={`/area/${p.area}`}>More about this place</Link>
              </p>
            )}
          </article>
        ))}
      </div>
      {shown.length > FIRST && (
        <div className="center" style={{ marginTop: 22 }}>
          <button type="button" className="btn btn-dark" onClick={() => setAll(!all)}>
            {all ? `Show the closest ${FIRST}` : `Show all ${shown.length}`}
          </button>
        </div>
      )}
    </>
  );
}

export function PlaceButton({ id, label }: { id: string; label: string }) {
  return (
    <button
      type="button"
      className="btn btn-sm btn-line"
      onClick={() => {
        document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
        window.dispatchEvent(new CustomEvent("basecamp:focus", { detail: id }));
      }}
    >
      📍 {label}
    </button>
  );
}
