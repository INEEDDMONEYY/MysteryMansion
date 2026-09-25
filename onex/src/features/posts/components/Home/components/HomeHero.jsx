
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useDevMessage } from "@/context/DevMessageContext";

const HERO_BG = "/mm-hero.png";

const stackMessageForMobile = (message = "", wordsPerLine = 4) => {
  const words = String(message)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length <= wordsPerLine) {
    return message;
  }

  const lines = [];

  for (let i = 0; i < words.length; i += wordsPerLine) {
    lines.push(words.slice(i, i + wordsPerLine).join(" "));
  }

  return lines.join("\n");
};

export default function HomeHero() {
  const { devMessage } = useDevMessage();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const isLoggedIn = Boolean(user?.username);

  const heroMessage =
    devMessage ||
    "Where imagination meets adventure. Every door opens to something unexpected, and every moment brings you closer to the unknown.";

  const mobileStackedMessage = stackMessageForMobile(
    heroMessage,
    4
  );

  return (
    <header className="relative w-full overflow-hidden bg-white px-3 py-8 font-[Jost,sans-serif] sm:px-4 sm:py-10">
      {/* Ambient pink glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-[85%] w-[90%] rounded-3xl bg-pink-400/20 blur-3xl" />
      </div>

      {/* Hero */}
      <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-xl shadow-2xl sm:rounded-2xl">

        {/* Hero image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${HERO_BG})`,
            backgroundPosition: "center top",
          }}
        />

        {/* Image readability overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-black/75" />

        {/* Logged-in greeting */}
        {isLoggedIn && (
          <div className="absolute left-3 top-3 z-10 max-w-[calc(100%-1.5rem)] truncate rounded-full border border-white/25 bg-black/40 px-3 py-1 text-[0.65rem] tracking-[0.05em] text-white backdrop-blur sm:left-6 sm:top-5 sm:max-w-none sm:px-4 sm:text-xs sm:tracking-[0.06em]">
            Welcome back,{" "}
            <strong>{user.username}</strong>
          </div>
        )}

        {/* Hero content */}
        <div className="relative z-[5] mx-auto flex min-h-[55vh] max-w-[760px] items-center justify-center px-4 py-14 text-center sm:min-h-[60vh] sm:px-6 sm:py-24">
          <div className="w-full">

            <p className="mx-auto mb-7 max-w-[520px] text-[0.9rem] font-light leading-[1.6] text-white/90 drop-shadow sm:mb-9 sm:text-[clamp(0.9rem,1.6vw,1.05rem)] sm:leading-[1.7]">
              <span className="whitespace-pre-line sm:hidden">
                {mobileStackedMessage}
              </span>

              <span className="hidden sm:inline">
                {heroMessage}
              </span>
            </p>

            {/* Logged-out CTA */}
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
                  times: [
                    0,
                    0.78,
                    0.85,
                    0.91,
                    0.96,
                    1,
                  ],
                }}
                className="inline-flex w-full max-w-[260px] sm:w-auto sm:max-w-none"
              >
                <Link
                  to="/signup"
                  className="inline-flex w-full items-center justify-center rounded-sm bg-white px-6 py-3 text-[0.68rem] font-medium uppercase tracking-[0.11em] text-[#111] transition hover:-translate-y-px hover:bg-[#e8e8e8] sm:px-10 sm:text-xs sm:tracking-[0.15em]"
                >
                  Join Now 🎉
                </Link>
              </Motion.div>
            )}

            {/* Logged-in CTA */}
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
                  times: [
                    0,
                    0.78,
                    0.85,
                    0.91,
                    0.96,
                    1,
                  ],
                }}
                className="inline-flex w-full max-w-[260px] sm:w-auto sm:max-w-none"
              >
                <Link
                  to="/promote"
                  className="inline-flex w-full items-center justify-center rounded-sm bg-white px-6 py-3 text-[0.68rem] font-medium uppercase tracking-[0.11em] text-[#111] transition hover:-translate-y-px hover:bg-[#e8e8e8] sm:px-10 sm:text-xs sm:tracking-[0.15em]"
                >
                  Promote Account
                </Link>
              </Motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
