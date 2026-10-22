const AdminRankCriteria = ({ rank }) => {
  if (!rank?.categoryScores?.length) {
    return (
      <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
        <p className="text-sm text-neutral-500">
          No ranking criteria are available.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
          Ranking Criteria
        </p>

        <h2 className="mt-1 text-lg font-semibold text-white">
          Criteria Breakdown
        </h2>
      </div>

      <div className="mt-6 space-y-6">
        {rank.categoryScores.map((category) => (
          <div key={category.id}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-white">
                  {category.label}
                </h3>

                <p className="mt-1 text-xs text-neutral-500">
                  Weight: {category.weight}%
                </p>
              </div>

              <span className="text-sm font-medium text-neutral-300">
                {Number(category.score || 0).toFixed(0)}
              </span>
            </div>

            {category.criteria?.length > 0 && (
              <div className="mt-3 overflow-hidden rounded-lg border border-neutral-800">
                {category.criteria.map((criterion) => (
                  <div
                    key={criterion.id}
                    className="flex flex-col gap-2 border-b border-neutral-800 bg-neutral-900/30 p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-neutral-200">
                        {criterion.label}
                      </p>

                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-neutral-500">
                        <span>
                          Type: {criterion.type}
                        </span>

                        <span>
                          Direction: {criterion.direction}
                        </span>

                        {criterion.visibility && (
                          <span>
                            Visibility: {criterion.visibility}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="shrink-0 text-sm font-medium text-white">
                      {Number(criterion.score || 0).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default AdminRankCriteria;