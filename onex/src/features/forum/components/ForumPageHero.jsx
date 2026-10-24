import { motion as Motion } from "framer-motion";

/**
 * Page hero with an optional background image. Set `image` in data/forumPageConfig.js;
 * `overlay` (0-1) controls how dark the tint over the image is.
 */
export default function ForumPageHero({
  eyebrow,
  title,
  highlight,
  description,
  image = "",
  imagePosition = "center",
  overlay = 0.6,
  children,
}) {
  const tint = Math.min(1, Math.max(0, Number(overlay) || 0));

  return (
    <section className="relative isolate overflow-hidden bg-black text-white">
      {image ? (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-cover bg-no-repeat"
            style={{
              backgroundImage: `url("${image}")`,
              backgroundPosition: imagePosition,
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-b from-black via-black to-black"
            style={{ opacity: tint }}
          />
        </>
      ) : (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-pink-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-yellow-400/10 blur-3xl" />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <Motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="max-w-3xl"
        >
          {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-pink-300">
              {eyebrow}
            </p>
          )}

          <h1 className="mt-3 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            {title}
            {highlight && (
              <span className="block bg-gradient-to-r from-pink-400 via-pink-500 to-yellow-400 bg-clip-text text-transparent">
                {highlight}
              </span>
            )}
          </h1>

          {description && (
            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-200 sm:text-lg sm:leading-8">
              {description}
            </p>
          )}

          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </Motion.div>
      </div>
    </section>
  );
}
