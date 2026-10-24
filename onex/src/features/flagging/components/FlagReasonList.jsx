import { Check } from "lucide-react";

const FlagReasonList = ({
  reasons = [],
  selectedReason,
  onSelect,
  disabled = false,
}) => {
  if (!reasons.length) {
    return (
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 text-sm text-neutral-400">
        No flag reasons are currently available.
      </div>
    );
  }

  return (
    <div className="space-y-1.5 sm:space-y-2">
      {reasons.map((reason) => {
        const isSelected = selectedReason === reason.id;

        return (
          <button
            key={reason.id}
            type="button"
            onClick={() => onSelect(reason.id)}
            disabled={disabled}
            className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition sm:p-4 ${
              isSelected
                ? "border-neutral-500 bg-neutral-800"
                : "border-neutral-800 bg-neutral-900 hover:border-neutral-700 hover:bg-neutral-800/70"
            } ${
              disabled
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer"
            }`}
          >
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                isSelected
                  ? "border-white bg-white text-black"
                  : "border-neutral-600"
              }`}
            >
              {isSelected && <Check size={13} strokeWidth={2.5} />}
            </span>

            <span className="min-w-0">
              <span className="block text-sm font-medium text-white">
                {reason.label}
              </span>

              {reason.description && (
                <span className="mt-1 hidden text-xs leading-relaxed text-neutral-400 sm:block">
                  {reason.description}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default FlagReasonList;