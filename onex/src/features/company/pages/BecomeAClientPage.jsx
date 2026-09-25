import ClientHero from "../components/client/ClientHero";
import ClientBenefits from "../components/client/ClientBenefits";
import ClientHowItWorks from "../components/client/ClientHowItWorks";
import ClientFeatures from "../components/client/ClientFeatures";
import ClientTrust from "../components/client/ClientTrust";
import ClientCta from "../components/client/ClientCta";

export default function BecomeAClientPage() {
  return (
    <main className="min-h-screen bg-white">
      <ClientHero />
      <ClientBenefits />
      <ClientHowItWorks />
      <ClientFeatures />
      <ClientTrust />
      <ClientCta />
    </main>
  );
}