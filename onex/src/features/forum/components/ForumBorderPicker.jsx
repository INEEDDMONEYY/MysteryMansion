import { FORUM_BORDER_OPTIONS } from "../utils/forumBorder";

/** Colour swatches for the thread border; "" means the default border. */
export default function ForumBorderPicker({ value, onChange, disabled = false }) {
  const swatch = (selected) =>
    `h-9 w-9 rounded-full border-2 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-500/30 disabled:opacity-60 ${
      selected ? "border-gray-900 scale-110" : "border-white shadow ring-1 ring-gray-200 hover:scale-105"
    }`;

  return (
    <div role="radiogroup" aria-label="Thread border colour" className="flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        role="radio"
        aria-checked={!value}
        aria-label="Default border"
        title="Default"
        disabled={disabled}
        onClick={() => onChange("")}
        className={`${swatch(!value)} bg-white text-[10px] font-semibold text-gray-500`}
      >
        None
      </button>

      {FORUM_BORDER_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={value === option.id}
          aria-label={`${option.label} border`}
          title={option.label}
          disabled={disabled}
          onClick={() => onChange(option.id)}
          className={`${swatch(value === option.id)} ${option.gradient}`}
        />
      ))}
    </div>
  );
}
