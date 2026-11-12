"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "@/lib/site";

const SOLID_ROUTES = /^\/(book|how-to-book|rental|owner|plan|contact|guide-|faq)/;

export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);
  const solid = scrolled || open || SOLID_ROUTES.test(path);
  return (
    <header className={"site-header" + (solid ? " solid" : "")}>
      <div className="container bar">
        <Link href="/" className="wordmark" aria-label="The Burland home">
          <span>The </span>
          <strong>Burland</strong>
        </Link>
        <button className="menu-btn" aria-expanded={open} aria-controls="site-nav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
          </svg>
        </button>
        <nav id="site-nav" className={"nav" + (open ? " open" : "")} aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={path.replace(/\/$/, "") === n.href ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
          <Link href="/book" className="btn btn-brass">Plan &amp; Book</Link>
        </nav>
      </div>
    </header>
  );
}
