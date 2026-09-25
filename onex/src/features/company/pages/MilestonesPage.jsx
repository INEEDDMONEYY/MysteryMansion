import { useEffect } from "react";

import MilestonesHero from "../components/milestones/components/MilestonesHero";
import MilestonesOverview from "../components/milestones/components/MilestonesOverview";
import MilestoneTracks from "../components/milestones/components/MilestoneTracks";
import MilestonePrinciples from "../components/milestones/components/MilestonePrinciples";
import MilestonesCta from "../components/milestones/components/MilestonesCta";

import { setSEO } from "@/shared/utils/seo";

export default function MilestonesPage() {
  useEffect(() => {
    setSEO(
      "Milestones | Mystery Mansion",
      "Explore Mystery Mansion milestones for providers and clients, including platform progression, recognition, and meaningful participation.",
      {
        robots: "index, follow",
        canonicalPath: "/milestones",
      }
    );
  }, []);

  return (
    <main className="w-full">
      <MilestonesHero />
      <MilestonesOverview />
      <MilestoneTracks />
      <MilestonePrinciples />
      <MilestonesCta />
    </main>
  );
}