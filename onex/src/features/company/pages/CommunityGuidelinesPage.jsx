import { useEffect } from "react";

import CommunityGuidelinesHero from "../components/community-guidelines/components/CommunityGuidelinesHero";
import CommunityGuidelinesSection from "../components/community-guidelines/components/CommunityGuidelinesSection";
import { setPublicPageSEO } from "@/shared/utils/seo";

export default function CommunityGuidelinesPage() {
  useEffect(() => {
    setPublicPageSEO("/community-guidelines");
  }, []);

  return (
    <main className="w-full">
      <CommunityGuidelinesHero />
      <CommunityGuidelinesSection />
    </main>
  );
}