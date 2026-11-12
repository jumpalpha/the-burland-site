// Every business fact the site states lives here. Edit this file to change a price, phone number, or policy.
// Facts match voice-assistant/knowledge-base.md. Keep the two in sync.

export const SITE = {
  name: "The Burland",
  url: "https://theburland.com",
  tagline: "A restored 1912 gathering place in downtown St. Anthony, Idaho",
  description:
    "A restored 1912 building in downtown St. Anthony, Idaho, built for family reunions, weddings, and retreats where everyone stays under one roof. Sleeps 40+, minutes from the St. Anthony Sand Dunes.",
  phone: "208-709-1403",
  phoneE164: "+12087091403",
  email: "burlandevents@gmail.com",
  city: "St. Anthony",
  region: "ID",
  regionName: "Idaho",
  county: "Fremont County",
  geo: { lat: 43.9663, lng: -111.6824 },
  founded: 1912,
  squareFeet: "10,000+",
  floors: 3,
  sleeps: "40+",
  weddingSeats: 100,
  maxInBuilding: 130,
  social: {
    facebook: "https://facebook.com/profile.php?id=61572102965997",
    instagram: "https://instagram.com/the_burland",
    tiktok: "https://tiktok.com/@theburland",
  },
  calendarEmbed:
    "https://calendar.google.com/calendar/embed?src=burlandevents%40gmail.com&ctz=America%2FBoise&mode=MONTH&showTitle=0&showPrint=0&showTabs=0&showCalendars=0",
  // Same Apps Script the old site used. It saves to the Burland sheet and emails the owner.
  formEndpoint:
    "https://script.google.com/macros/s/AKfycbyuwAzTwUtD1CHtg94bdir8_mx8_vSagoIu07MBtsykxTwnKAa6tB4ESmmFKq_-uan4/exec",
  // Optional public read-only availability feed returning {ok, events:[{allDay,start,end,kind}]}.
  // Leave empty and the booking calendar falls back to "we confirm by hand".
  availabilityEndpoint: process.env.NEXT_PUBLIC_AVAILABILITY_URL ?? "",
  checkIn: "3:00 p.m.",
  checkOutDefault: "11:00 a.m.",
};

// Prefix for raw asset paths when the site is served under a sub-path (preview builds).
export const asset = (p: string) => (process.env.NEXT_PUBLIC_BASE_PATH || "") + p;

export const IS_PREVIEW = process.env.NEXT_PUBLIC_SITE_ENV !== "production";

export const EVENT_TYPES = ["Family reunion", "Wedding", "Reception", "Party", "Retreat"] as const;
export const FOUND_US = ["Google", "Website", "Referral from a friend", "Facebook", "Instagram", "Flyer", "Storefront"] as const;

// Named spaces from the rental agreement form.
export const SPACES = [
  "Aspen Ballroom",
  "Game room",
  "Bear Den",
  "Loft",
  "Whitetail Room",
  "Movie/Play room",
  "Buffalo Herd",
  "Wolf Den",
  "Moose Crossing",
  "Fishing Pond",
] as const;

export const RATES = {
  off: { weeknight: 800, weekend: 1000, holiday: 1300 },
  peak: { weeknight: 1200, weekend: 1500 },
  hourly: { first: 200, additional: 75 },
  minNights: { offWeekend: 2, offHoliday: 3, peak: 2 },
  peakMonths: [5, 6, 7, 8, 9],
  maxNights: 14,
};

export const ADDONS = {
  decor: {
    none: { label: "No decor package", price: 0, formValue: "None" },
    basic: { label: "Basic decor package", price: 200, formValue: "Decoration rental" },
    deluxe: { label: "Deluxe Celebration package", price: 500, formValue: "Decoration rental plus setup by staff" },
  },
  whiteTablecloth: 10,
  alcohol: 200,
};

export const POLICY = {
  bookingPercent: 0.5,
  balanceDaysBefore: 90,
  securityDeposit: 1000,
  cleaningFee: 250,
};

export const PACKAGES = [
  {
    key: "basic" as const,
    name: "Basic Package",
    price: 200,
    blurb: "You handle setup; we provide the linens and centerpieces.",
    items: [
      "Black tablecloths",
      "Table centerpieces from our current selection",
      "White tablecloths available, $10 each",
    ],
  },
  {
    key: "deluxe" as const,
    name: "Deluxe Celebration Package",
    price: 500,
    blurb: "Simplify your day and let us do the work.",
    items: [
      "Everything in the Basic Package",
      "Two pre-wedding consultations",
      "Octagon backdrop and decor signs",
      "Microphone, projector, cake table",
      "Choice of all decor varieties",
      "Staff setup",
    ],
  },
];

export const NAV = [
  { href: "/reunions", label: "Reunions" },
  { href: "/weddings", label: "Weddings" },
  { href: "/pricing", label: "Pricing" },
  { href: "/availability", label: "Availability" },
  { href: "/how-to-book", label: "How to Book" },
  { href: "/gallery", label: "Gallery" },
  { href: "/basecamp", label: "Basecamp" },
  { href: "/plan", label: "Planning Tools" },
];

export const fmtUSD = (n: number) =>
  "$" + Math.round(n).toLocaleString("en-US");
