import { useEffect } from "react";

import CreditsHero from "../components/credits/components/CreditsHero";
import CreditsOverview from "../components/credits/components/CreditsOverview";
import CreditsHowItWorks from "../components/credits/components/CreditsHowItWorks";
import CreditsBenefits from "../components/credits/components/CreditsBenefits";
import CreditsCta from "../components/credits/components/CreditsCta";
import { setPublicPageSEO } from "@/shared/utils/seo";

export default function CreditsPage() {
  useEffect(() => {
    setPublicPageSEO("/credits");
  }, []);

  return (
    <main className="w-full">
      <CreditsHero />
      <CreditsOverview />
      <CreditsHowItWorks />
      <CreditsBenefits />
      <CreditsCta />
    </main>
  );
}