import { useEffect } from "react";

import { setPublicPageSEO } from "@/shared/utils/seo";

import {
  ReviewIncentivesHero,
  ReviewIncentivesOverview,
  ReviewIncentivesHowItWorks,
  ReviewIncentivesMilestones,
  ReviewIncentivesPayoutOptions,
  ReviewIncentivesStandards,
  ReviewIncentivesCta,
} from "../components/review-incentives/components";

export default function ReviewIncentivesPage() {
  useEffect(() => {
    setPublicPageSEO("/review-incentives");
  }, []);

  return (
    <>
      <main className="min-h-screen overflow-hidden bg-black text-white">
        <ReviewIncentivesHero />

        <ReviewIncentivesOverview />

        <ReviewIncentivesHowItWorks />

        <ReviewIncentivesMilestones/>

        <ReviewIncentivesPayoutOptions />

        <ReviewIncentivesStandards />

        <ReviewIncentivesCta />
      </main>
    </>
  );
}