import { useEffect } from "react";
import { ShieldCheck } from "lucide-react";

import PolicyHero from "../components/policies/components/PolicyHero";
import PolicyContent from "../components/policies/components/PolicyContent";
import { privacyPolicyData } from "../components/policies/data/privacyPolicyData";
import { setSEO } from "@/shared/utils/seo";

export default function PrivacyPolicyPage() {
  const { hero, introduction, sections } =
    privacyPolicyData;

  useEffect(() => {
    setSEO(
      "Privacy Policy | Mystery Mansion",
      "Learn how Mystery Mansion collects, uses, discloses, and safeguards information when you use the platform.",
      {
        robots: "index, follow",
        canonicalPath: "/privacy-policy",
      }
    );
  }, []);

  return (
    <main className="w-full">
      <PolicyHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        effectiveDate={hero.effectiveDate}
        icon={ShieldCheck}
      />

      <PolicyContent
        introduction={introduction}
        sections={sections}
      />
    </main>
  );
}
