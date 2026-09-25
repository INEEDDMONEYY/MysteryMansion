import { useEffect } from "react";

import CreditsHero from "../components/credits/components/CreditsHero";
import CreditsOverview from "../components/credits/components/CreditsOverview";
import CreditsHowItWorks from "../components/credits/components/CreditsHowItWorks";
import CreditsBenefits from "../components/credits/components/CreditsBenefits";
import CreditsCta from "../components/credits/components/CreditsCta";
import { setSEO } from "@/shared/utils/seo";

export default function CreditsHowItWorksPage() {
  useEffect(() => {
    setSEO(
      "Credits How It Works | Mystery Mansion",
      "Learn how Mystery Mansion credits work, how credits are added to your account, and how they can be used across eligible platform features.",
      {
        robots: "index, follow",
        canonicalPath: "/credits/how-it-works",
      }
    );
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