import { useEffect } from "react";

import ReviewIncentivesHero from "../components/review-incentives/components/ReviewIncentivesHero";
import ReviewIncentivesOverview from "../components/review-incentives/components/ReviewIncentivesOverview";
import ReviewIncentivesHowItWorks from "../components/review-incentives/components/ReviewIncentivesHowItWorks";
import ReviewIncentivesStandards from "../components/review-incentives/components/ReviewIncentivesStandards";
import ReviewIncentivesCta from "../components/review-incentives/components/ReviewIncentivesCta";
import { setSEO } from "@/shared/utils/seo";

export default function ReviewIncentivesPage() {
  useEffect(() => {
    setSEO(
      "Review Incentives | Mystery Mansion",
      "Learn how Mystery Mansion review incentives work, what makes a review eligible, and the standards for honest community feedback.",
      {
        robots: "index, follow",
        canonicalPath: "/review-incentives",
      }
    );
  }, []);

  return (
    <main className="w-full">
      <ReviewIncentivesHero />
      <ReviewIncentivesOverview />
      <ReviewIncentivesHowItWorks />
      <ReviewIncentivesStandards />
      <ReviewIncentivesCta />
    </main>
  );
}