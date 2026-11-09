import Link from "next/link";

export default function NotFound() {
  return (
    <section style={{ paddingTop: 160, minHeight: "70vh" }}>
      <div className="container narrow center">
        <div className="eyebrow">404</div>
        <h1>Looks like this page wandered off to the dunes</h1>
        <p className="lede">Let&apos;s get you back on the trail.</p>
        <div className="row"><Link href="/" className="btn btn-dark">Home</Link><Link href="/book" className="btn btn-brass">Check dates</Link></div>
      </div>
    </section>
  );
}
