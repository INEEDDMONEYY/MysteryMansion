import { ShieldCheck } from "lucide-react";

const AccountRankBadge = ({
  rank,
  size = "default",
  showLabel = true,
}) => {
  if (!rank) {
    return null;
  }

  const sizeClasses =
    size === "small"
      ? {
          container: "h-9 w-9",
          icon: "h-4 w-4",
          text: "text-sm",
        }
      : {
          container: "h-11 w-11",
          icon: "h-5 w-5",
          text: "text-base",
        };

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex shrink-0 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 ${sizeClasses.container}`}
        title={rank.rank?.name || "Account Rank"}
      >
        <ShieldCheck
          className={`text-white ${sizeClasses.icon}`}
          aria-hidden="true"
        />
      </div>

      {showLabel && (
        <div className="min-w-0">
          <p
            className={`truncate font-semibold text-white ${sizeClasses.text}`}
          >
            {rank.rank?.name || "Unranked"}
          </p>

          {rank.rank?.publicMeaning && (
            <p className="truncate text-xs text-neutral-400">
              {rank.rank.publicMeaning}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountRankBadge;