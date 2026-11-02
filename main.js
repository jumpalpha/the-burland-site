document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }
});

// Spam protection: every form gets a page token and a "time on page" value.
// The Apps Script checks both (see apps-script/Code.gs in the private backup repo).
document.addEventListener("DOMContentLoaded", function () {
  var t0 = Date.now();
  var tk = (Math.floor(t0 / 1000) * 7 + 1912).toString(36);
  ["guide-form", "inquiry-form", "rental-form"].forEach(function (id) {
    var f = document.getElementById(id);
    if (!f) return;
    function hidden(name, value) {
      var el = f.querySelector('input[name="' + name + '"]');
      if (!el) { el = document.createElement("input"); el.type = "hidden"; el.name = name; f.appendChild(el); }
      el.value = value;
      return el;
    }
    hidden("t0", String(t0));
    hidden("tk", tk);
    var el = hidden("el", "0");
    f.addEventListener("submit", function () { el.value = String(Math.round((Date.now() - t0) / 1000)); }, true);
  });
  var d = document.getElementById("date");
  if (d) { var t = new Date(); d.min = new Date(t.getTime() - t.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
});

// Free planning guides: floating link on every page, and the guide request form.
document.addEventListener("DOMContentLoaded", function () {
  var path = location.pathname;
  if (!/guide/.test(path)) {
    var tab = document.createElement("a");
    tab.className = "guide-tab";
    tab.href = "guides.html";
    tab.textContent = "Free Planning Guides";
    document.body.appendChild(tab);
  }
  var form = document.getElementById("guide-form");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = document.getElementById("guide-msg");
    var email = form.elements["email"].value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      msg.textContent = "Please enter a valid email address.";
      return;
    }
    msg.textContent = "Sending...";
    fetch(form.action, {
      method: "POST",
      body: new URLSearchParams(new FormData(form))
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j.ok) throw new Error("bad");
      var pick = form.elements["guide_requested"].value;
      msg.textContent = "Thank you. Your guide is ready below.";
      var links = document.getElementById("guide-links");
      links.hidden = false;
      document.getElementById("dl-reunion").style.display = pick === "Wedding Planning Guide" ? "none" : "";
      document.getElementById("dl-wedding").style.display = pick === "Family Reunion Planning Guide" ? "none" : "";
      links.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }).catch(function () {
      msg.textContent = "Something went wrong. Please email burlandevents@gmail.com and we will send the guide.";
    });
  });
});

// Booking inquiry form: saves to the Burland sheet and emails the owner. Nothing is booked automatically.
document.addEventListener("DOMContentLoaded", function () {
  var f = document.getElementById("inquiry-form");
  if (!f) return;
  f.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = document.getElementById("inquiry-msg");
    var email = f.elements["email"].value.trim();
    if (!f.elements["name"].value.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      msg.textContent = "Please enter your name and a valid email address.";
      return;
    }
    msg.textContent = "Sending...";
    var btn = f.querySelector("button[type=submit]");
    btn.disabled = true;
    fetch(f.action, { method: "POST", body: new URLSearchParams(new FormData(f)) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.ok) throw new Error("bad");
        msg.textContent = "Thank you. We received your inquiry and will reply personally, usually within one business day. Nothing is booked until we confirm with you.";
        f.reset();
      })
      .catch(function () {
        btn.disabled = false;
        msg.textContent = "Something went wrong. Please call or text 208-709-1403 or email burlandevents@gmail.com.";
      });
  });
});

// Rental agreement details: saves to the Rentals tab and emails the owner, who reviews and makes the contract.
document.addEventListener("DOMContentLoaded", function () {
  var f = document.getElementById("rental-form");
  if (!f) return;
  var all = document.getElementById("r-all"), rooms = f.querySelectorAll(".room");
  all.addEventListener("change", function () { rooms.forEach(function (x) { x.checked = all.checked; }); });
  rooms.forEach(function (x) { x.addEventListener("change", function () { all.checked = [].every.call(rooms, function (y) { return y.checked; }); }); });
  var alc = document.getElementById("r-alc"), types = document.getElementById("r-alc-types");
  var alcBoxes = f.querySelectorAll(".alc");
  function syncAlc() {
    types.hidden = alc.value !== "Yes";
    if (types.hidden) alcBoxes.forEach(function (x) { x.checked = false; });
  }
  alc.addEventListener("change", syncAlc);
  var s = document.getElementById("r-start"), e = document.getElementById("r-end");
  var t = new Date(), today = new Date(t.getTime() - t.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  s.min = today; e.min = today;
  s.addEventListener("change", function () { e.min = s.value || today; if (!e.value || e.value < s.value) e.value = s.value; });

  // Pre-fill from a Request to Book: the owner's email links here with #r=CODE.
  // The code is looked up by the Apps Script, so no personal details travel in the link.
  var ref = new URLSearchParams(location.hash.slice(1)).get("r");
  if (ref && /^[A-Za-z0-9]{8,40}$/.test(ref)) {
    var note = document.getElementById("r-prefill");
    fetch(f.action, { method: "POST", body: new URLSearchParams({ api: "prefill", r: ref }) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.ok || !j.data) throw new Error("bad");
        var d = j.data;
        function put(name, v) { var el = f.elements[name]; if (el && v != null && String(v) !== "") el.value = String(v); }
        ["name", "phone", "email", "street", "city", "state", "zip", "max_guests"].forEach(function (k) { put(k, d[k]); });
        put("purpose", d.event_type);
        if (/^\d{4}-\d{2}-\d{2}$/.test(d.booking_date || "")) {
          var start = new Date(d.booking_date + "T12:00:00");
          put("start_date", d.booking_date);
          var n = parseInt(d.nights, 10) || 0;
          var end = new Date(start.getTime() + n * 86400000);
          put("end_date", end.getFullYear() + "-" + String(end.getMonth() + 1).padStart(2, "0") + "-" + String(end.getDate()).padStart(2, "0"));
        }
        put("check_in", "15:00");
        if (d.addons) put("decorations", d.addons);
        if (d.alcohol === "Yes" || d.alcohol === "No") { put("alcohol", d.alcohol); syncAlc(); }
        put("message", d.message);
        put("inquiry_ref", ref);
        note.textContent = "We filled in what you sent us. Please check it, then add your check-out time and the spaces you'd like" + (d.alcohol === "Yes" ? ", and the types of alcohol." : ".");
        note.hidden = false;
      })
      .catch(function () {
        note.textContent = "We couldn't load your earlier details. Please fill in the form below.";
        note.hidden = false;
      });
  }

  f.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var msg = document.getElementById("rental-msg");
    var picked = [].filter.call(rooms, function (x) { return x.checked; }).map(function (x) { return x.value; });
    if (!picked.length) { msg.textContent = "Please choose at least one space."; return; }
    if (e.value < s.value) { msg.textContent = "The departure date can't be before the arrival date."; return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.elements["email"].value.trim())) { msg.textContent = "Please enter a valid email address."; return; }
    if (alc.value === "Yes" && ![].some.call(alcBoxes, function (x) { return x.checked; })) { msg.textContent = "Please check at least one type of alcohol."; return; }
    f.elements["rooms"].value = picked.join(", ");
    f.elements["alcohol_types"].value = [].filter.call(f.querySelectorAll(".alc"), function (x) { return x.checked; }).map(function (x) { return x.value; }).join(", ");
    msg.textContent = "Sending...";
    var btn = f.querySelector("button[type=submit]");
    btn.disabled = true;
    var data = new FormData(f);
    data.delete("room");
    fetch(f.action, { method: "POST", body: new URLSearchParams(data) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.ok) throw new Error("bad");
        msg.textContent = "Thank you. We received your details and will email your rental agreement from SignNow, usually within one or two business days. Please check your spam folder if you don't see it.";
        f.reset(); syncAlc(); document.getElementById("r-prefill").hidden = true;
      })
      .catch(function () {
        btn.disabled = false;
        msg.textContent = "Something went wrong. Please call or text 208-709-1403 or email burlandevents@gmail.com.";
      });
  });
});
