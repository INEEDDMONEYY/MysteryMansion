import { useEffect } from "react";

import ReferralsHero from "../components/referrals/components/ReferralsHero";
import ReferralsOverview from "../components/referrals/components/ReferralsOverview";
import ReferralHowItWorks from "../components/referrals/components/ReferralHowItWorks";
import ReferralBenefits from "../components/referrals/components/ReferralBenefits";
import ReferralStandards from "../components/referrals/components/ReferralStandards";
import ReferralsCta from "../components/referrals/components/ReferralsCta";

import { setSEO } from "@/shared/utils/seo";

export default function ReferralsPage() {
  useEffect(() => {
    setSEO(
      "Referrals | Mystery Mansion",
      "Learn how Mystery Mansion referrals work, how providers can invite potential clients, and how referral activity can support provider progression.",
      {
        robots: "index, follow",
        canonicalPath: "/referrals",
      }
    );
  }, []);

  return (
    <main className="w-full">
      <ReferralsHero />
      <ReferralsOverview />
      <ReferralHowItWorks />
      <ReferralBenefits />
      <ReferralStandards />
      <ReferralsCta />
    </main>
  );
}