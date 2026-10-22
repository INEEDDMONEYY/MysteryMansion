import CreditPackageCard from "./CreditPackageCard";

export default function CreditPackagesGrid({ packages = [] }) {
  if (!packages.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-neutral-900/70 px-6 py-12 text-center">
        <h2 className="text-xl font-semibold text-white">
          No credit packages are currently available.
        </h2>
        <p className="mt-3 text-sm leading-7 text-neutral-400">
          Please check back later for available Mystery Mansion credit options.
        </p>
      </div>
    );
  }

  return (
    <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {packages.map((pack, index) => (
        <CreditPackageCard
          key={pack.id}
          pack={pack}
          index={index}
        />
      ))}
    </div>
  );
}