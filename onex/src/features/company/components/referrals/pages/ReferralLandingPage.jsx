import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import ReferralLanding from "../components/ReferralLanding";
import api from "@/shared/utils/api";
import { storeReferralCode } from "@/shared/utils/referral";
import { setSEO } from "@/shared/utils/seo";

export default function ReferralLandingPage() {
  const { referralCode } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setSEO(
      "You've Been Invited | Mystery Mansion",
      "You've been invited to join Mystery Mansion. Explore the platform and create a Client account.",
      {
        robots: "noindex, nofollow",
        canonicalPath: `/referral/${referralCode || ""}`,
      }
    );
  }, [referralCode]);

  useEffect(() => {
    if (!referralCode) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    let alive = true;
    (async () => {
      try {
        const { data } = await api.get(`/referrals/resolve/${referralCode}`);
        if (!alive) return;
        storeReferralCode(referralCode);
        setProvider(data?.provider || null);
      } catch {
        if (alive) setNotFound(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [referralCode]);

  if (loading) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-black text-white">
        <p className="text-gray-400">Loading invitation...</p>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-black px-4 text-center text-white">
        <h1 className="text-2xl font-bold">This invitation link isn't valid.</h1>
        <p className="text-gray-400">
          It may have expired or been typed incorrectly.
        </p>
        <Link
          to="/signup?type=client"
          className="rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white hover:bg-pink-500"
        >
          Create a Client Account
        </Link>
      </main>
    );
  }

  return (
    <main className="w-full">
      <ReferralLanding
        providerName={provider?.username}
        referralCode={referralCode}
      />
    </main>
  );
}