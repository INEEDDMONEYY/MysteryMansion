import { Link } from "react-router-dom";
import Logo from "@/assets/Logo.png";
import Partners from "/partner.png";
import { FEATURE_FLAGS } from "@/config/featureFlags";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      className="bg-black text-white border-t border-gray-800 pt-10 pb-6 px-6 w-full"
    >
      {/* Google Font import via style tag trick */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');`}</style>

      <div className="max-w-6xl mx-auto">

        {/* ── Main 3-col grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6 items-start">

          {/* Col 1 — Brand */}
          <div className="flex flex-col items-center sm:items-start gap-3">
            <img src={Logo} alt="Mystery Mansion Logo" className="h-14 w-auto" />
            <p
              style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "0.04em" }}
              className="text-white text-lg font-bold leading-tight"
            >
              Mystery Mansion
            </p>
            <p className="text-gray-500 text-xs">© {year}. All rights reserved.</p>
          </div>

          {/* Col 2 — Platform Policies */}
          <div className="flex flex-col items-center gap-3 text-center">
            <h3
              style={{ letterSpacing: "0.12em", fontSize: "0.65rem" }}
              className="text-pink-500 uppercase font-semibold tracking-widest"
            >
              Platform Policies
            </h3>
            <div className="flex flex-col gap-1.5 text-sm text-gray-400">
              <Link to="/terms-policy" className="hover:text-pink-400 transition-colors duration-200">
                Terms of Service
              </Link>
              <Link to="/privacy-policy" className="hover:text-pink-400 transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/faq" className="hover:text-pink-400 transition-colors duration-200">
                FAQ
              </Link>
              <span className="text-gray-600 cursor-default">Community Guidelines</span>
            </div>

            {FEATURE_FLAGS.ENABLE_FOLLOW_US && (
              <div className="mt-2 flex flex-col gap-1 text-gray-500 text-xs">
                <span className="text-gray-600 uppercase tracking-widest text-[0.6rem]">Follow Us</span>
                <div className="flex gap-3 justify-center">
                  <span className="hover:text-pink-400 cursor-pointer transition-colors">Instagram</span>
                  <span className="text-gray-700">·</span>
                  <span className="hover:text-pink-400 cursor-pointer transition-colors">Twitter</span>
                  <span className="text-gray-700">·</span>
                  <span className="hover:text-pink-400 cursor-pointer transition-colors">LinkedIn</span>
                </div>
              </div>
            )}
          </div>

          {/* Col 3 — Platform Updates */}
          <div className="flex flex-col items-center sm:items-end gap-3 text-center sm:text-right">
            <h3
              style={{ letterSpacing: "0.12em", fontSize: "0.65rem" }}
              className="text-pink-500 uppercase font-semibold tracking-widest"
            >
              Platform Updates
            </h3>
            <Link
              to="/platform-updates"
              className="text-sm text-gray-400 hover:text-pink-400 transition-colors duration-200"
            >
              View latest updates
            </Link>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="my-8 border-t border-gray-800" />

        {/* ── Bottom bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-gray-600 text-xs">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <p>Built with ❤️ for a safer experience. Designed by Mystery Mansion.</p>
            <span className="hidden sm:inline">|</span>
            <Link
              to="/contact"
              className="text-pink-400 hover:text-pink-300 underline underline-offset-2 transition-colors duration-200"
            >
              Contact Support
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <a
              href="https://fantometechnologies.com"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-70 hover:opacity-100 transition-opacity duration-200"
            >
              <img src={Partners} alt="Fantome Technologies" className="h-5 w-auto" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}