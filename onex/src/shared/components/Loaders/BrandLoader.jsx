import loadingSvg from "@/assets/logos/loading.svg";

// The SVG animates itself (SMIL), so a plain <img> keeps playing everywhere.
const SIZES = {
  xs: "w-20",
  sm: "w-32",
  md: "w-48",
  lg: "w-64 sm:w-72",
  xl: "w-72 sm:w-96",
};

const TONES = {
  light: { screen: "bg-white", text: "text-gray-500" },
  dark: { screen: "bg-neutral-950", text: "text-neutral-400" },
};

/**
 * Mystery Mansion loading animation.
 *
 * size:       xs | sm | md | lg | xl
 * label:      optional visible caption under the animation
 * fullScreen: covers the viewport (route/server loading)
 * inline:     renders without the padded, centered block wrapper
 * delay:      fades in after a short delay so fast loads don't flash
 */
export default function BrandLoader({
  size = "md",
  label = "",
  fullScreen = false,
  inline = false,
  delay = false,
  tone = "light",
  className = "",
  children,
}) {
  const palette = TONES[tone] || TONES.light;

  const content = (
    <>
      <img
        src={loadingSvg}
        alt=""
        aria-hidden="true"
        draggable="false"
        className={`${SIZES[size] || SIZES.md} h-auto max-w-full select-none`}
      />
      {label ? (
        <p className={`mt-3 text-sm ${palette.text}`}>{label}</p>
      ) : (
        <span className="sr-only">Loading…</span>
      )}
      {children}
    </>
  );

  const fade = delay ? "mm-loader-fade-in" : "";

  if (fullScreen) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`fixed inset-0 z-[90] flex flex-col items-center justify-center px-6 text-center ${palette.screen} ${fade} ${className}`}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${
        inline ? "inline-flex" : "col-span-full flex w-full py-10"
      } flex-col items-center justify-center text-center ${fade} ${className}`}
    >
      {content}
    </div>
  );
}
