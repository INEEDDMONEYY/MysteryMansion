import { useEffect } from "react";

import CommunityGuidelinesHero from "../components/community-guidelines/components/CommunityGuidelinesHero";
import CommunityGuidelinesSection from "../components/community-guidelines/components/CommunityGuidelinesSection";
import { setSEO } from "@/shared/utils/seo";

export default function CommunityGuidelinesPage() {
  useEffect(() => {
    setSEO(
      "Community Guidelines | Mystery Mansion",
      "Read the Mystery Mansion community guidelines covering respect, boundaries, authenticity, privacy, safety, reporting, and responsible platform use.",
      {
        robots: "index, follow",
        canonicalPath: "/community-guidelines",
      }
    );
  }, []);

  return (
    <main className="w-full">
      <CommunityGuidelinesHero />
      <CommunityGuidelinesSection />
    </main>
  );
}