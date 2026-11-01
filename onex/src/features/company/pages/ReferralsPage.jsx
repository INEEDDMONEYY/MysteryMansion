import { useEffect } from "react";

import ReferralsHero from "../components/referrals/components/ReferralsHero";
import ReferralsOverview from "../components/referrals/components/ReferralsOverview";
import ReferralHowItWorks from "../components/referrals/components/ReferralHowItWorks";
import ReferralBenefits from "../components/referrals/components/ReferralBenefits";
import ReferralStandards from "../components/referrals/components/ReferralStandards";
import ReferralsCta from "../components/referrals/components/ReferralsCta";

import { setPublicPageSEO } from "@/shared/utils/seo";

export default function ReferralsPage() {
  useEffect(() => {
    setPublicPageSEO("/referrals");
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