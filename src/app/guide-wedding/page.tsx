import { GuidePage } from "@/components/GuidePage";
import { WEDDING_GUIDE } from "@/lib/guides";
import { meta } from "@/lib/seo";

export const metadata = meta({ title: "Wedding Planning Guide", description: "A free 12 to 18 month wedding checklist: budget, guest list, lodging, vendors, and the day-of timeline.", path: "/guide-wedding", image: "img-ballroom-tables" });

export default function Page() {
  return <GuidePage g={WEDDING_GUIDE} other={{ href: "/guide-reunion", label: "Get the Family Reunion Guide" }} />;
}
