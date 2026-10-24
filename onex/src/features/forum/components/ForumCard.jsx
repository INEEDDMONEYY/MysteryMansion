/** Standard white panel used for forum sidebars and info blocks. */
export default function ForumCard({
  title,
  eyebrow,
  children,
  className = "",
}) {
  return (
    <section
      className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-sm ${className}`}
    >
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-600">
          {eyebrow}
        </p>
      )}

      {title && (
        <h3 className="mt-2 text-lg font-bold text-gray-950">{title}</h3>
      )}

      <div className={title || eyebrow ? "mt-3" : ""}>{children}</div>
    </section>
  );
}
