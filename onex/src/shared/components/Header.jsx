import { useDevMessage } from "@/context/DevMessageContext";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";

const stackMessageForMobile = (message = "", wordsPerLine = 4) => {
  const words = String(message).trim().split(/\s+/).filter(Boolean);

  if (words.length <= wordsPerLine) {
    return message;
  }

  const lines = [];

  for (let i = 0; i < words.length; i += wordsPerLine) {
    lines.push(words.slice(i, i + wordsPerLine).join(" "));
  }

  return lines.join("\n");
};

export default function Header() {
  const { devMessage } = useDevMessage();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const isLoggedIn = Boolean(user?.username);

  const heroMessage =
    devMessage ||
    "Where imagination meets adventure. Every door opens to something unexpected, and every moment brings you closer to the unknown.";

  const mobileStackedMessage = stackMessageForMobile(heroMessage, 4);

  return (
    <header className="relative w-full overflow-hidden font-[Jost,sans-serif]">
      {/* Full-width ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-400/10 blur-3xl" />

        <div className="absolute left-[5%] top-[15%] h-40 w-40 rounded-full bg-pink-300/10 blur-3xl" />

        <div className="absolute bottom-[5%] right-[5%] h-48 w-48 rounded-full bg-yellow-300/10 blur-3xl" />
      </div>

      {/* Full-width hero surface */}
      <div className="relative w-full border-b border-gray-100 bg-gradient-to-br from-white via-white to-pink-50/60">
        {/* Decorative gradients */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-pink-300/10 blur-3xl" />

          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-yellow-300/10 blur-3xl" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 mx-auto flex min-h-[420px] w-full max-w-screen-2xl items-center justify-center px-4 py-16 sm:min-h-[480px] sm:px-6 sm:py-20 lg:min-h-[520px] lg:px-10 lg:py-24">
          <div className="mx-auto w-full max-w-3xl text-center">
            {/* Logged-in greeting */}
            {isLoggedIn && (
              <div className="mb-6 inline-flex max-w-full items-center rounded-full border border-pink-100 bg-white/80 px-4 py-2 text-xs tracking-[0.05em] text-gray-600 shadow-sm backdrop-blur">
                Welcome back,{" "}
                <strong className="ml-1 text-gray-900">
                  {user.username}
                </strong>
              </div>
            )}

            {/* Eyebrow */}
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-pink-600">
              Mystery Mansion
            </p>

            {/* Main message */}
            <p className="mx-auto max-w-2xl text-[0.95rem] font-light leading-7 text-gray-600 sm:text-base sm:leading-8">
              <span className="whitespace-pre-line sm:hidden">
                {mobileStackedMessage}
              </span>

              <span className="hidden sm:inline">
                {heroMessage}
              </span>
            </p>

            {/* CTA */}
            <div className="mt-8 flex justify-center">
              {!isLoggedIn && (
                <Motion.div
                  animate={{
                    y: [0, 0, -2, 1, -1, 0],
                    rotate: [0, 0, -1.2, 1.2, -0.7, 0],
                  }}
                  transition={{
                    duration: 3,
                    ease: "easeInOut",
                    repeat: Infinity,
                    times: [0, 0.78, 0.85, 0.91, 0.96, 1],
                  }}
                >
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-pink-500 via-pink-600 to-pink-500 px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    Join Now 🎉
                  </Link>
                </Motion.div>
              )}

              {isLoggedIn && (
                <Motion.div
                  animate={{
                    y: [0, 0, -2, 1, -1, 0],
                    rotate: [0, 0, -1.2, 1.2, -0.7, 0],
                  }}
                  transition={{
                    duration: 3,
                    ease: "easeInOut",
                    repeat: Infinity,
                    times: [0, 0.78, 0.85, 0.91, 0.96, 1],
                  }}
                >
                  <Link
                    to="/promote"
                    className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-pink-500 via-pink-600 to-pink-500 px-8 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    Promote Account
                  </Link>
                </Motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}