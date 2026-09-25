// 📞 Post Contact

export default function PostContact({
  phoneNumber = "",
  phoneHref = "",
  email = "",
  emailHref = "",
}) {
  return (
    <section className="border-b border-gray-200 py-6">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold text-pink-500">
          Contact
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Phone
            </p>

            <div className="mt-1 break-all text-sm">
              {phoneNumber ? (
                <a
                  href={phoneHref}
                  className="font-medium text-pink-600 underline decoration-pink-400 underline-offset-2 transition-colors hover:text-pink-700"
                >
                  {phoneNumber}
                </a>
              ) : (
                <span className="italic text-gray-400">
                  Not provided
                </span>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Email
            </p>

            <div className="mt-1 break-all text-sm">
              {email ? (
                <a
                  href={emailHref}
                  className="font-medium text-pink-600 underline decoration-pink-400 underline-offset-2 transition-colors hover:text-pink-700"
                >
                  {email}
                </a>
              ) : (
                <span className="italic text-gray-400">
                  Not provided
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}