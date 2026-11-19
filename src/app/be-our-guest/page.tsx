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
          <h1 style={{ fontSize: "clamp(2.1rem,4.2vw,3.1rem)" }}>The Burland is yours to enjoy, on us</h1>
          <p className="lede">If you&apos;re reading this, you&apos;re a friend, and friends stay free.</p>

          <p>We restored this old 1912 building for one reason: to bring people together. Watching families fill the ballroom, crowd around the kitchen island, and stay up too late in the game room is the best part of all of this for us. We&apos;d love for you to have that same experience with the people you care about.</p>
          <p>So come for a reunion, a family weekend, a youth activity, a small celebration, or just a getaway near the dunes and Yellowstone. The suites, the kitchen, the ballroom, and the game room are all yours while you&apos;re here. There&apos;s no rental fee and no bill at the end.</p>

          <h2>What we ask in return</h2>
          <p>Honestly, nothing. You don&apos;t owe us a thing, and we mean that.</p>
          <p>If you have a great stay and feel we&apos;ve earned it, a positive review would mean the world to us. It helps other families find The Burland and keeps this place going. But only if you feel we deserve one. No pressure, ever.</p>
          <p className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <a className="btn btn-dark btn-sm" href={GOOGLE_REVIEW} rel="noopener" target="_blank">Leave a review on Google</a>
            <a className="btn btn-line btn-sm" href={FACEBOOK_REVIEW} rel="noopener" target="_blank">Leave a review on Facebook</a>
          </p>

          <h2>Picking your dates</h2>
          <p>Just reach out and we&apos;ll find a time that works. Take a look at the <a href="/availability">availability calendar</a>, then call or text <a href={`tel:${SITE.phone}`}>{SITE.phone}</a> or email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> and tell us you&apos;re coming as our guest.</p>
          <p>We can&apos;t wait to have you.</p>
          <p><strong>Alan and Milly</strong></p>
        </div>
      </section>
    </GuestGate>
  );
}
