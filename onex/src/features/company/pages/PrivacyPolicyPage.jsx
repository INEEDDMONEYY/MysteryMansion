import { useEffect } from "react";
import { ShieldCheck } from "lucide-react";

import PolicyHero from "../components/policies/components/PolicyHero";
import PolicyContent from "../components/policies/components/PolicyContent";
import { privacyPolicyData } from "../components/policies/data/privacyPolicyData";
import { setPublicPageSEO } from "@/shared/utils/seo";

export default function PrivacyPolicyPage() {
  const { hero, introduction, sections } =
    privacyPolicyData;

  useEffect(() => {
    setPublicPageSEO("/privacy-policy");
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
