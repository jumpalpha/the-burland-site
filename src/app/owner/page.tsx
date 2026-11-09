import { OwnerTools } from "@/components/owner/OwnerTools";
import { meta } from "@/lib/seo";

export const metadata = meta({ title: "Owner Toolkit", description: "Owner tools for The Burland.", path: "/owner", noindex: true });

export default function Owner() {
  return (
    <section style={{ paddingTop: 128 }}>
      <div className="container">
        <div className="eyebrow">Owner toolkit</div>
        <h1 style={{ fontSize: "clamp(2rem,4vw,2.8rem)" }}>Run The Burland in fewer clicks</h1>
        <p className="lede" style={{ marginBottom: 28 }}>Quotes, replies, payment reminders, and checklists. Everything you type here stays in this browser on this device.</p>
        <OwnerTools />
      </div>
    </section>
  );
}
