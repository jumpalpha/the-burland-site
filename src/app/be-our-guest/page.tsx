import { GuestGate } from "@/components/guest/GuestGate";
import { meta } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = meta({ title: "Be Our Guest", description: "A note for friends of The Burland.", path: "/be-our-guest", noindex: true });

const FACEBOOK_REVIEW = `${SITE.social.facebook}&sk=reviews`;
// Google Business Profile "The Burland Event Center" (place ID from Google Maps).
const GOOGLE_REVIEW = "https://search.google.com/local/writereview?placeid=ChIJF38OL0v7U1MRvviMNADq-MY";

export default function BeOurGuest() {
  return (
    <GuestGate>
      <section style={{ paddingTop: 140 }}>
        <div className="container narrow prose">
          <div className="eyebrow">Be Our Guest</div>
          <h1 style={{ fontSize: "clamp(2.1rem,4.2vw,3.1rem)" }}>We have an opening, and we thought of you</h1>
          <p className="lede">Every so often a night or a weekend at The Burland comes open. When it does, we love sharing it with people we care about.</p>

          <p>We restored this old 1912 building to bring people together. Watching families fill the ballroom, crowd around the kitchen island, and stay up too late in the game room is the best part of all of this for us. When the building would otherwise sit empty, we&apos;d much rather see it full of your people.</p>
          <p>If we sent you here, it&apos;s because a date is open and we&apos;d like you to have it as our guest, at no charge. It&apos;s a gift for that stay, so future visits are booked like normal. Use it for a family get-together, a small celebration, or just a getaway near the dunes and Yellowstone. The suites, the kitchen, the ballroom, and the game room are yours while you&apos;re here.</p>

          <h2>What we ask in return</h2>
          <p>Honestly, nothing. You don&apos;t owe us a thing for this stay, and we mean that.</p>
          <p>If you have a great stay and feel we&apos;ve earned it, a positive review would mean the world to us. It helps other families find The Burland and keeps this place going. But only if you feel we deserve one. No pressure, ever.</p>
          <p className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <a className="btn btn-dark btn-sm" href={GOOGLE_REVIEW} rel="noopener" target="_blank">Leave a review on Google</a>
            <a className="btn btn-line btn-sm" href={FACEBOOK_REVIEW} rel="noopener" target="_blank">Leave a review on Facebook</a>
          </p>

          <h2>Locking in your date</h2>
          <p>Just reach out to confirm the night or weekend we talked about. Call or text <a href={`tel:${SITE.phone}`}>{SITE.phone}</a> or email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> and let us know you&apos;re coming as our guest.</p>
          <p>We can&apos;t wait to have you.</p>
          <p><strong>Alan and Milly</strong></p>
        </div>
      </section>
    </GuestGate>
  );
}
