import { useEffect } from "react";
import { setSEO } from "@/shared/utils/seo";
import {
  MembershipHero,
  MembershipPlans,
  MembershipBenefits,
  MembershipHowItWorks,
  MembershipFaq,
  MembershipCta,
} from "../components/membership/components";
import { membershipPageData } from "../components/membership/data/membershipPageData";

export default function MembershipPage() {
  useEffect(() => {
    setSEO(
      membershipPageData.seo.title,
      membershipPageData.seo.description
    );
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <MembershipHero />
      <MembershipPlans />
      <MembershipBenefits />
      <MembershipHowItWorks />
      <MembershipFaq />
      <MembershipCta />
    </main>
  );
}