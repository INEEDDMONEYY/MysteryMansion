// 📝 Post Description

export default function PostDescription({
  description = "",
}) {
  const text =
    description || "No description provided.";

  return (
    <section className="border-b border-gray-200 py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold text-pink-500">
          Description
        </h2>

        <div className="mt-4 max-w-5xl text-base leading-7 text-gray-700">
          {text
            .split(/(?<=[.!?])\s+/)
            .map((sentence, index) => (
              <span key={index}>
                {sentence}
                <br />
              </span>
            ))}
        </div>
      </div>
    </section>
  );
}