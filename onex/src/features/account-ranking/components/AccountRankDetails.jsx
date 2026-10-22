const AccountRankDetails = ({ rank }) => {
  if (!rank) {
    return null;
  }

  const score = Number(rank.score || 0);

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Account Rank
          </p>

          <h3 className="mt-1 text-lg font-semibold text-white">
            {rank.rank?.name || "Unranked"}
          </h3>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-2xl font-semibold text-white">
            {score.toFixed(0)}
          </p>

          <p className="text-xs text-neutral-500">
            Current score
          </p>
        </div>
      </div>

      {rank.rank?.publicMeaning && (
        <p className="mt-4 text-sm leading-6 text-neutral-400">
          {rank.rank.publicMeaning}
        </p>
      )}

      {rank.categoryScores?.length > 0 && (
        <div className="mt-6 space-y-4">
          {rank.categoryScores.map((category) => (
            <div key={category.id}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-sm text-neutral-300">
                  {category.label}
                </span>

                <span className="text-xs text-neutral-500">
                  {Number(category.score || 0).toFixed(0)}
                </span>
              </div>

              <div
                className="h-1.5 overflow-hidden rounded-full bg-neutral-800"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{
                    width: `${Math.min(
                      Math.max(Number(category.score || 0), 0),
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default AccountRankDetails;