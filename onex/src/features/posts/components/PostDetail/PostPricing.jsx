// 💲 Post Pricing

import UserMeetupDisplay from "@/features/users/components/UserMeetupDisplay";

export default function PostPricing({
  prices = {},
  hasPrices = false,
}) {
  if (!hasPrices) {
    return null;
  }

  return (
    <section className="border-b border-gray-200 py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-xl font-semibold text-pink-500">
          Donations
        </h2>

        <div className="h-auto overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <UserMeetupDisplay prices={prices} />
        </div>
      </div>
    </section>
  );
}