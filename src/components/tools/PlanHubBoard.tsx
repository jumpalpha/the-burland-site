"use client";
import Link from "next/link";
import { useStored } from "@/lib/useStored";
import { FAMILY_CODE_KEY } from "@/lib/useFamilyPlan";
import { FamilyBoard } from "./FamilyBoard";

// The planning hub shows the same family discussion as the planners, using the code saved on this device.
export function PlanHubBoard() {
  const [code] = useStored<string>(FAMILY_CODE_KEY, "");
  return (
    <FamilyBoard
      code={code}
      page="plan"
      noCodeHint={<>Create or join a family code on the <Link href="/plan/meals">meal planner</Link>, <Link href="/plan/packing">what to bring</Link>, or <Link href="/plan/itinerary">itinerary</Link> page to start the conversation.</>}
    />
  );
}
