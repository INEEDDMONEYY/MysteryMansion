import { useEffect } from "react";

import MilestonesHero from "../components/milestones/components/MilestonesHero";
import MilestonesOverview from "../components/milestones/components/MilestonesOverview";
import MilestoneTracks from "../components/milestones/components/MilestoneTracks";
import MilestonePrinciples from "../components/milestones/components/MilestonePrinciples";
import MilestonesCta from "../components/milestones/components/MilestonesCta";

import { setPublicPageSEO } from "@/shared/utils/seo";

export default function MilestonesPage() {
  useEffect(() => {
    setPublicPageSEO("/milestones");
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