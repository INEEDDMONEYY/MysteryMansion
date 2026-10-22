const AdminRankOverview = ({ rank }) => {
  if (!rank) {
    return (
      <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
        <p className="text-sm text-neutral-500">
          No ranking information is available.
        </p>
      </section>
    );
  }

  const score = Number(rank.score || 0);

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Account Ranking
          </p>

          <h2 className="mt-1 text-xl font-semibold text-white">
            {rank.rank?.name || "Unranked"}
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            {rank.role === "provider"
              ? "Provider account"
              : "Client account"}
          </p>
        </div>

        <div className="sm:text-right">
          <p className="text-3xl font-semibold text-white">
            {score.toFixed(0)}
          </p>

          <p className="text-xs text-neutral-500">
            Current score
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <p className="text-xs text-neutral-500">
            Rank
          </p>

          <p className="mt-1 font-medium text-white">
            {rank.rank?.label || "Unranked"}
          </p>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <p className="text-xs text-neutral-500">
            Version
          </p>

          <p className="mt-1 font-medium text-white">
            v{rank.version}
          </p>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
          <p className="text-xs text-neutral-500">
            Next Rank
          </p>

          <p className="mt-1 font-medium text-white">
            {rank.nextRank?.name || "Maximum"}
          </p>
        </div>
      </div>
    </section>
  );
};

export default AdminRankOverview;