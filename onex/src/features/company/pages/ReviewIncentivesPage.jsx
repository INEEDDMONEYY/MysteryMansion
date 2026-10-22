import { useEffect } from "react";

import { setSEO } from "@/shared/utils/seo";

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
    setSEO(
      "Review Incentives & Provider Rewards | Mystery Mansion",
      "Discover the Mystery Mansion provider incentive program. Learn how signup referrals, credit milestones, and eligible monetary rewards work."
    );
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