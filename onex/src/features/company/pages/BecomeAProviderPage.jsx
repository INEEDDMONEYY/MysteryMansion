import ProviderHero from "../components/provider/ProviderHero";
import ProviderBenefits from "../components/provider/ProviderBenefits";
import ProviderHowItWorks from "../components/provider/ProviderHowItWorks";
import ProviderFeatures from "../components/provider/ProviderFeatures";
import ProviderGrowth from "../components/provider/ProviderGrowth";
import ProviderTrust from "../components/provider/ProviderTrust";
import ProviderCta from "../components/provider/ProviderCta";

export default function BecomeAProviderPage() {
  return (
    <main className="min-h-screen bg-white">
      <ProviderHero />
      <ProviderBenefits />
      <ProviderHowItWorks />
      <ProviderFeatures />
      <ProviderGrowth />
      <ProviderTrust />
      <ProviderCta />
    </main>
  );
}