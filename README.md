# The Burland

Website for The Burland, a restored 1912 venue in St. Anthony, Idaho. Next.js (static export) hosted on GitHub Pages at theburland.com.

## Change a price, phone number, or policy

Edit `src/lib/site.ts`. Every page, the booking estimator, the owner quote builder, and the FAQ read from it.
Keep `voice-assistant/knowledge-base.md` in sync so the voice assistant says the same thing.

Other copy:
- `src/lib/content.ts`: photos, area guide, FAQs, reviews, sample weekend.
- `src/lib/guides.ts`: the printable reunion and wedding guides.

Local facts in the area guide are sourced (links on each `/area/...` page). Check drive times in Google Maps before changing them.

## What's on the site

- **Plan & Book** (`/book`): pick dates on a calendar with nightly prices, see the minimum-stay rules, estimate, and payment schedule, then send a request. It posts to the same Apps Script as before (`formEndpoint` in `site.ts`), so requests land in the Inquiries sheet and the owner's email with the full estimate. Nothing is booked automatically.
- **Rental details** (`/rental`): same form and `#r=CODE` prefill as the old `rental.html`.
- **Guest planning tools** (`/plan`): cost splitter, itinerary builder, meal sign-up planner, packing list. Saved in the visitor's browser only.
- **Owner toolkit** (`/owner`, hidden from search): quote builder with discounts, reply templates, payment tracker with calendar reminders, and turnover checklists. Saved in that browser only; the Burland sheet stays the official record.
- **Live availability (optional):** set `NEXT_PUBLIC_AVAILABILITY_URL` to a public read-only feed in the same shape as `voice-assistant/calendar-apps-script` and the booking calendar greys out booked nights. Without it, the site links to the Google Calendar embed.

## Develop

```
npm install
npm run dev        # http://localhost:3000
npm test           # pricing, cost split, availability parsing
npm run build      # static site in out/
```

Builds are **preview** (noindex, robots blocks everything, red banner) unless `NEXT_PUBLIC_SITE_ENV=production`. The deploy workflow sets production only on `main`.

## Deploy

`.github/workflows/deploy.yml` builds and deploys `main` to GitHub Pages. Before merging this branch to `main`, switch **Settings > Pages > Source** to **GitHub Actions**. Otherwise Pages keeps serving the branch root, which no longer has the old HTML files.

Old URLs keep working: `/pricing.html`, `/rental.html#r=CODE`, and the rest redirect to the new pages. `rental-review.html`, `voice-assistant-test.html`, and `dopp-week/` are served unchanged from `public/`.
