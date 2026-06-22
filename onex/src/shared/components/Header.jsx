import { useDevMessage } from "@/context/DevMessageContext";
import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";

const HERO_BG = "/mm-hero.png";

const stackMessageForMobile = (message = "", wordsPerLine = 4) => {
  const words = String(message).trim().split(/\s+/).filter(Boolean);
  if (words.length <= wordsPerLine) return message;

  const lines = [];
  for (let i = 0; i < words.length; i += wordsPerLine) {
    lines.push(words.slice(i, i + wordsPerLine).join(" "));
  }

  return lines.join("\n");
};

export default function Header() {
  const { devMessage } = useDevMessage();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const isLoggedIn = user && user.username;
  const heroMessage =
    devMessage ||
    "Where imagination meets adventure. Every door opens to something unexpected, and every moment brings you closer to the unknown.";
  const mobileStackedMessage = stackMessageForMobile(heroMessage, 4);

  return (
    <header className="relative flex min-h-[70vh] w-full items-center justify-center px-3 pt-8 pb-12 font-[Jost,sans-serif] sm:min-h-[72vh] sm:px-4 sm:pt-10 sm:pb-16">
      {/* Pink Glow Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-[85%] w-[90%] rounded-3xl bg-pink-400/20 blur-3xl"></div>
      </div>

      {/* Hero Image Container */}
      <div className="relative w-full max-w-6xl overflow-hidden rounded-xl shadow-2xl sm:rounded-2xl">

        {/* Blurred Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-md scale-105"
          style={{
            backgroundImage: `url(${HERO_BG})`,
            backgroundPosition: "center top",
          }}
        />

        {/* Dark Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-black/75" />

        {/* Greeting for logged-in users */}
        {isLoggedIn && (
          <div className="absolute left-3 top-3 z-10 max-w-[calc(100%-1.5rem)] truncate rounded-full border border-white/25 bg-black/40 px-3 py-1 text-[0.65rem] tracking-[0.05em] text-white backdrop-blur sm:left-6 sm:top-5 sm:max-w-none sm:px-4 sm:text-xs sm:tracking-[0.06em]">
            Welcome back, <strong>{user.username}</strong>
          </div>
        )}

        {/* Instagram follow link */}
        <a
          href="https://www.instagram.com/mysteryymansionn/"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full border border-white/25 bg-black/40 px-3 py-1 text-[0.65rem] tracking-[0.05em] text-white backdrop-blur transition hover:bg-black/60 sm:bottom-5 sm:right-6 sm:px-4 sm:text-xs sm:tracking-[0.06em]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0"
            aria-hidden="true"
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          Follow us
        </a>

        {/* Hero Content */}
        <div className="relative z-[5] mx-auto max-w-[760px] px-4 py-14 text-center sm:px-6 sm:py-24">

          <p className="mx-auto mb-7 max-w-[520px] text-[0.9rem] font-light leading-[1.6] text-white/90 drop-shadow sm:mb-9 sm:text-[clamp(0.9rem,1.6vw,1.05rem)] sm:leading-[1.7]">
            <span className="whitespace-pre-line sm:hidden">{mobileStackedMessage}</span>
            <span className="hidden sm:inline">{heroMessage}</span>
          </p>

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
    </header>
  );
}