const AccountRankProgress = ({ rank }) => {
  if (!rank) {
    return null;
  }

  const progress = Math.min(
    Math.max(Number(rank.progress || 0), 0),
    100
  );

  const hasNextRank = Boolean(rank.nextRank);

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Rank Progress
          </p>

          <h3 className="mt-1 text-base font-semibold text-white">
            {hasNextRank
              ? `Progress toward ${rank.nextRank.name}`
              : "Maximum rank reached"}
          </h3>
        </div>

        <span className="text-sm font-medium text-neutral-300">
          {progress}%
        </span>
      </div>

      <div
        className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-800"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-white transition-all"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      {hasNextRank ? (
        <p className="mt-3 text-sm text-neutral-500">
          {rank.pointsToNextRank}{" "}
          {rank.pointsToNextRank === 1 ? "point" : "points"} to{" "}
          {rank.nextRank.name}
        </p>
      ) : (
        <p className="mt-3 text-sm text-neutral-500">
          This account is currently at the highest available rank.
        </p>
      )}
    </section>
  );
};

export default AccountRankProgress;