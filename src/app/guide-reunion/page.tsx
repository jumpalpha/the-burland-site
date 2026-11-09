import { GuidePage } from "@/components/GuidePage";
import { REUNION_GUIDE } from "@/lib/guides";
import { meta } from "@/lib/seo";

export const metadata = meta({ title: "Family Reunion Planning Guide", description: "A free 9 to 12 month family reunion checklist: budget, head count, sleeping, meals, activities, and keepsakes.", path: "/guide-reunion", image: "img-ballroom-dinner-setup" });

export default function Page() {
  return <GuidePage g={REUNION_GUIDE} other={{ href: "/guide-wedding", label: "Get the Wedding Guide" }} />;
}
