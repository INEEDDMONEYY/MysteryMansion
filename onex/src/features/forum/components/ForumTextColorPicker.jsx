import { FORUM_TEXT_COLOR_OPTIONS } from "../utils/forumTextColor";

/** Title and description colour pairs for the thread; "" means the default text. */
export default function ForumTextColorPicker({ value, onChange, allowedIds = [], disabled = false }) {
  const swatch = (selected) =>
    `flex h-9 items-center gap-1 rounded-full border-2 px-2.5 text-[11px] font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-500/30 disabled:opacity-60 ${
      selected ? "border-gray-900 scale-105" : "border-white shadow ring-1 ring-gray-200 hover:scale-105"
    }`;

  return (
    <div role="radiogroup" aria-label="Thread text colour" className="flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        role="radio"
        aria-checked={!value}
        aria-label="Default text colour"
        title="Default"
        disabled={disabled}
        onClick={() => onChange("")}
        className={`${swatch(!value)} bg-white text-gray-500`}
      >
        Default
      </button>

      {FORUM_TEXT_COLOR_OPTIONS.map((option) => {
        const allowed = allowedIds.includes(option.id);
        const solid = option.title === option.description;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={value === option.id}
            aria-label={`${option.label} text colour`}
            title={allowed ? option.label : `${option.label} (membership perk)`}
            disabled={disabled || !allowed}
            onClick={() => onChange(option.id)}
            className={`${swatch(value === option.id)} ${solid ? "w-9 px-0" : ""}`}
            style={solid ? { backgroundColor: option.title } : { backgroundColor: option.description }}
          >
            {solid ? (
              <span className="sr-only">{option.label}</span>
            ) : (
              <>
                <span className="rounded px-1" style={{ color: option.title }}>
                  Aa
                </span>
                <span className="sr-only">{option.label}</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
