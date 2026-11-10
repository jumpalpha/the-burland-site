/* Burland Basecamp: podcast list, area map, and explorer. Data lives in basecamp/data.js. */
(function () {
  var HOME = [43.9663, -111.6824]; // The Burland, downtown St. Anthony
  // Drive times in data.js are unconfirmed estimates. Keep false until Orion confirms them.
  var SHOW_DRIVE = false;
  var CATS = {
    parks:     { label: "National parks",       color: "#2B3A2E" },
    water:     { label: "Rivers & fishing",     color: "#2F6F8F" },
    adventure: { label: "Adventure",            color: "#A8813C" },
    family:    { label: "Kids & rainy day",     color: "#8C3B2E" },
    lava:      { label: "Lava country",         color: "#5B4A3F" },
    towns:     { label: "Towns",                color: "#6E7F5C" },
    hunting:   { label: "Hunting",              color: "#7A5C2E" }
  };
  var SEASON = { summer: "Summer", winter: "Winter", year: "Year-round" };
  var places = window.BASECAMP_ATTRACTIONS || [];
  var episodes = window.BASECAMP_EPISODES || [];
  var byId = {};
  places.forEach(function (p) { byId[p.id] = p; });

  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) {
      if (k === "class") e.className = attrs[k];
      else if (k === "style") e.setAttribute("style", attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---------- Podcast ---------- */
  function renderEpisodes() {
    var box = document.getElementById("bc-episodes");
    if (!box) return;
    episodes.forEach(function (ep) {
      var row = el("article", { class: "bc-ep" });
      row.appendChild(el("div", { class: "bc-ep-n" }, String(ep.n).padStart(2, "0")));
      var body = el("div");
      body.appendChild(el("h3", null, ep.title));
      var meta = [ep.date, ep.length].filter(Boolean).join(" · ");
      if (meta) body.appendChild(el("div", { class: "bc-meta" }, meta));
      body.appendChild(el("p", null, ep.blurb));
      if (ep.status === "live" && ep.audio) {
        var a = el("audio", { controls: "", preload: "none", src: ep.audio });
        body.appendChild(a);
      } else {
        body.appendChild(el("span", { class: "bc-soon" }, "Coming soon"));
      }
      if (ep.links && ep.links.length) {
        var links = el("div", { class: "bc-ep-links" });
        ep.links.forEach(function (id) {
          var p = byId[id];
          if (!p) return;
          var b = el("button", { type: "button" }, "📍 " + p.name.split(" (")[0].split(":")[0]);
          b.addEventListener("click", function () { focusPlace(id); });
          links.appendChild(b);
        });
        body.appendChild(links);
      }
      row.appendChild(body);
      box.appendChild(row);
    });
  }

  /* ---------- Explorer ---------- */
  var state = { cats: {}, season: "all" };
  Object.keys(CATS).forEach(function (c) { state.cats[c] = true; });
  var markers = {};
  var map = null;

  function visible(p) {
    if (!state.cats[p.cat]) return false;
    if (state.season === "all") return true;
    return p.season === state.season || p.season === "year";
  }

  function renderFilters() {
    var box = document.getElementById("bc-filters");
    var all = el("button", { type: "button", class: "bc-chip", "aria-pressed": "true" }, "Everything");
    all.addEventListener("click", function () {
      Object.keys(CATS).forEach(function (c) { state.cats[c] = true; });
      syncChips(); update();
    });
    box.appendChild(all);
    Object.keys(CATS).forEach(function (c) {
      var b = el("button", { type: "button", class: "bc-chip", "data-cat": c, "aria-pressed": "true" });
      var dot = el("span", { class: "dot", style: "background:" + CATS[c].color });
      b.appendChild(dot);
      b.appendChild(document.createTextNode(CATS[c].label));
      b.addEventListener("click", function () {
        var allOn = Object.keys(state.cats).every(function (k) { return state.cats[k]; });
        if (allOn) { Object.keys(state.cats).forEach(function (k) { state.cats[k] = false; }); state.cats[c] = true; }
        else {
          state.cats[c] = !state.cats[c];
          if (!Object.keys(state.cats).some(function (k) { return state.cats[k]; })) Object.keys(state.cats).forEach(function (k) { state.cats[k] = true; });
        }
        syncChips(); update();
      });
      box.appendChild(b);
    });
    function syncChips() {
      var allOn = Object.keys(state.cats).every(function (k) { return state.cats[k]; });
      all.setAttribute("aria-pressed", String(allOn));
      box.querySelectorAll("[data-cat]").forEach(function (b) {
        b.setAttribute("aria-pressed", String(!allOn && state.cats[b.dataset.cat]));
      });
    }
    syncChips();

    document.querySelectorAll("#bc-season button").forEach(function (b) {
      b.addEventListener("click", function () {
        state.season = b.dataset.season;
        document.querySelectorAll("#bc-season button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        update();
      });
    });
  }

  function card(p) {
    var c = el("article", { class: "bc-card", id: "place-" + p.id, style: "--c:" + CATS[p.cat].color });
    c.appendChild(el("h3", null, p.name));
    if (SHOW_DRIVE) c.appendChild(el("div", { class: "when" }, "About " + p.drive + " · ~" + p.miles + " mi"));
    c.appendChild(el("p", null, p.blurb));
    var tags = el("div", { class: "bc-tags" });
    if (p.gem) tags.appendChild(el("span", { class: "bc-tag gem" }, "Local favorite"));
    tags.appendChild(el("span", { class: "bc-tag" }, CATS[p.cat].label));
    tags.appendChild(el("span", { class: "bc-tag" }, SEASON[p.season]));
    c.appendChild(tags);
    if (map) {
      var b = el("button", { type: "button", class: "see" }, "Show on map ↑");
      b.addEventListener("click", function () { focusPlace(p.id); });
      c.appendChild(b);
    }
    return c;
  }

  function update() {
    var list = document.getElementById("bc-list");
    list.innerHTML = "";
    var shown = places.filter(visible).sort(function (a, b) { return a.miles - b.miles; });
    var limit = state.expanded ? shown.length : 10;
    shown.slice(0, limit).forEach(function (p) { list.appendChild(card(p)); });
    if (!shown.length) list.appendChild(el("p", null, "Nothing in this category for that season. Try another category or season."));
    var more = document.getElementById("bc-more");
    more.hidden = shown.length <= limit;
    more.textContent = "Show all " + shown.length + " places";
    document.getElementById("bc-count").textContent = shown.length + " places, closest first";
    if (map) {
      places.forEach(function (p) {
        var m = markers[p.id];
        if (visible(p)) { if (!map.hasLayer(m)) m.addTo(map); }
        else if (map.hasLayer(m)) map.removeLayer(m);
      });
    }
  }

  function focusPlace(id) {
    var p = byId[id];
    if (!p) return;
    if (!visible(p)) {
      Object.keys(CATS).forEach(function (c) { state.cats[c] = true; });
      state.season = "all";
      document.querySelectorAll("#bc-season button").forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.season === "all")); });
      document.querySelectorAll("#bc-filters .bc-chip").forEach(function (b) { b.setAttribute("aria-pressed", String(!b.dataset.cat)); });
      update();
    }
    if (!state.expanded) { state.expanded = true; update(); }
    var target = document.getElementById("bc-map") && map ? document.getElementById("bc-map") : document.getElementById("place-" + id);
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    if (map) {
      map.setView([p.lat, p.lng], 9);
      markers[id].openPopup();
    }
    var c = document.getElementById("place-" + id);
    if (c) { c.classList.add("flash"); setTimeout(function () { c.classList.remove("flash"); }, 2500); }
  }

  function initMap() {
    if (!window.L) { var m = document.getElementById("bc-map"); if (m) m.style.display = "none"; return; }
    map = L.map("bc-map", { scrollWheelZoom: false }).setView(HOME, 7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 15, attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);
    [50, 100, 150].forEach(function (mi) {
      L.circle(HOME, { radius: mi * 1609.34, color: "#A8813C", weight: 1.5, dashArray: "5 6", fill: false, interactive: false }).addTo(map);
      var labelPt = [HOME[0] + mi / 69.0, HOME[1]];
      L.marker(labelPt, { interactive: false, icon: L.divIcon({ className: "", html: '<span style="font:600 11px var(--font-body);color:#3B2A1E;background:rgba(248,244,233,.85);padding:1px 5px;white-space:nowrap">' + mi + ' mi</span>', iconSize: [44, 14], iconAnchor: [22, 7] }) }).addTo(map);
    });
    L.marker(HOME, { icon: L.divIcon({ className: "", html: '<div class="bc-home">B</div>', iconSize: [22, 22], iconAnchor: [11, 11] }), zIndexOffset: 1000 })
      .addTo(map).bindPopup("<strong>The Burland</strong><br>Your basecamp in St. Anthony");
    places.forEach(function (p) {
      var icon = L.divIcon({ className: "", html: '<div class="bc-pin" style="background:' + CATS[p.cat].color + '"></div>', iconSize: [14, 14], iconAnchor: [7, 7] });
      markers[p.id] = L.marker([p.lat, p.lng], { icon: icon, title: p.name })
        .bindPopup("<strong>" + p.name + "</strong>" + (SHOW_DRIVE ? "<br>About " + p.drive + " from The Burland" : "") +
          '<br><a href="#place-' + p.id + '">Details ↓</a>');
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    try { initMap(); } catch (e) { map = null; }
    renderEpisodes();
    renderFilters();
    document.getElementById("bc-more").addEventListener("click", function () { state.expanded = true; update(); });
    update();
  });
})();
