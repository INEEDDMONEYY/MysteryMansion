import { useEffect } from "react";
import { setPublicPageSEO } from "@/shared/utils/seo";
import {
  MembershipHero,
  MembershipPlans,
  MembershipBenefits,
  MembershipHowItWorks,
  MembershipFaq,
  MembershipCta,
} from "../components/membership/components";

export default function MembershipPage() {
  useEffect(() => {
    setPublicPageSEO("/membership");
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