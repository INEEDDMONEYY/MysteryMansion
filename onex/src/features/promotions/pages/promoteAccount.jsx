import PromotionTiers from "../components/PromotionTiers";
import PromotionFAQ from "../components/PromotionFAQ";
import PromotionPayment from "../components/PromotionPayment";

import { useEffect } from "react";
import { setSEO } from "@/shared/utils/seo";

export default function PromoteAccount() {
  useEffect(() => {
    setSEO(
      "Promote Your Escort Profile | Mystery Mansion",
      "Promote your profile on Mystery Mansion, an escort and sex work advertising platform, to increase visibility and reach more potential clients.",
      { robots: "index, follow", canonicalPath: "/promote" }
    );
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-pink-50 via-white to-yellow-50 text-gray-900">
      {/* Main Content Wrapper */}
      <main className="flex-1 w-full">
        {/* 📢 Promotion Header */}
        <section className="text-center px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16 max-w-3xl mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-pink-600 mb-3">
            Get Seen First by 13k+ Visitors
          </h1>

          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            Promoting your account increases your visibility and helps you reach
            more potential clients.
            <span className="block mt-2 italic font-medium text-yellow-600 text-sm">
              Providers are already upgrading to promotion + verification to stand out
            </span>
          </p>
        </section>

        {/* 💳 Promotion Tiers */}
        <section className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 max-w-7xl mx-auto">
          <PromotionTiers />
        </section>

        {/* ❓ FAQ'S */}
        <section className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 max-w-7xl mx-auto">
          <PromotionFAQ />
        </section>

        {/* 💵 Promotion Payment */}
        <section className="px-4 sm:px-6 lg:px-8 pb-10 sm:pb-12 lg:pb-16 max-w-7xl mx-auto">
          <PromotionPayment />
        </section>
      </main>

    </div>
  );
}
