const AdminRankHistory = ({ history = [] }) => {
  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
          Ranking History
        </p>

        <h2 className="mt-1 text-lg font-semibold text-white">
          Score Changes
        </h2>
      </div>

      {!history.length ? (
        <div className="mt-6 rounded-lg border border-dashed border-neutral-800 p-5">
          <p className="text-sm text-neutral-500">
            No ranking history is available yet.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-neutral-800">
          {history.map((entry, index) => (
            <div
              key={entry.id || `${entry.timestamp}-${index}`}
              className="flex flex-col gap-3 border-b border-neutral-800 bg-neutral-900/30 p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-white">
                  {entry.reason || "Ranking update"}
                </p>

                {entry.timestamp && (
                  <p className="mt-1 text-xs text-neutral-500">
                    {entry.timestamp}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm">
                {entry.previousScore !== undefined && (
                  <span className="text-neutral-500">
                    {entry.previousScore}
                  </span>
                )}

                {entry.score !== undefined && (
                  <span className="font-medium text-white">
                    {entry.score}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default AdminRankHistory;