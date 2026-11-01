import { useEffect } from "react";
import { FileText } from "lucide-react";

import PolicyHero from "../components/policies/components/PolicyHero";
import PolicyContent from "../components/policies/components/PolicyContent";
import { termsOfUseData } from "../components/policies/data/termsOfUseData";
import { setPublicPageSEO } from "@/shared/utils/seo";

export default function TermsOfUsePage() {
  const { hero, introduction, sections } =
    termsOfUseData;

  useEffect(() => {
    setPublicPageSEO("/terms-policy");
  }, []);

  return (
    <main className="w-full">
      <PolicyHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        effectiveDate={hero.effectiveDate}
        icon={FileText}
      />

      <PolicyContent
        introduction={introduction}
        sections={sections}
      />
    </main>
  );
}