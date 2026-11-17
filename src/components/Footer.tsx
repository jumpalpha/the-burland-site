import Link from "next/link";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link href="/" className="wordmark" style={{ color: "#fff" }}>
              <span>The </span>
              <strong>Burland</strong>
            </Link>
            <p style={{ marginTop: 14, maxWidth: "38ch" }}>
              A restored 1912 building in downtown St. Anthony, Idaho, built for family reunions, weddings, and gatherings where everyone stays under one roof.
            </p>
            <p>
              <a href={`tel:${SITE.phone}`}>Call or text {SITE.phone}</a>
              <br />
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </p>
          </div>
          <div>
            <h4>Gather</h4>
            <ul>
              <li><Link href="/reunions">Family reunions</Link></li>
              <li><Link href="/weddings">Weddings</Link></li>
              <li><Link href="/retreats">Retreats and gatherings</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/availability">Availability</Link></li>
              <li><Link href="/book">Plan and book</Link></li>
              <li><Link href="/how-to-book">How booking works</Link></li>
            </ul>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link href="/gallery">Photo gallery</Link></li>
              <li><Link href="/our-story">Our story</Link></li>
              <li><Link href="/basecamp">Burland Basecamp guide &amp; podcast</Link></li>
              <li><Link href="/area-attractions">Things to do nearby</Link></li>
              <li><Link href="/area/st-anthony-sand-dunes">St. Anthony Sand Dunes</Link></li>
              <li><Link href="/area/yellowstone">Yellowstone day trips</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4>Plan</h4>
            <ul>
              <li><Link href="/plan">Planning tools</Link></li>
              <li><Link href="/plan/cost-splitter">Reunion cost splitter</Link></li>
              <li><Link href="/plan/itinerary">Itinerary builder</Link></li>
              <li><Link href="/plan/meals">Meal sign-up planner</Link></li>
              <li><Link href="/guides">Free planning guides</Link></li>
              <li><Link href="/contact">Contact and tours</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} The Burland &middot; St. Anthony, Idaho</span>
          <span>
            <a href={SITE.social.facebook} rel="noopener">Facebook</a> &middot; <a href={SITE.social.instagram} rel="noopener">Instagram</a> &middot;{" "}
            <a href={SITE.social.tiktok} rel="noopener">TikTok</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
