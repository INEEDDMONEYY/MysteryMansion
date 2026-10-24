import { Link } from "react-router-dom";
import Logo from "@/assets/Logo.png";
import Partners from "/partner.png";
import { FEATURE_FLAGS } from "@/config/featureFlags";

const headingClass =
  "text-pink-500 uppercase font-semibold tracking-widest";

const linkClass =
  "text-sm text-gray-400 transition-colors duration-200 hover:text-pink-400";

function FooterSection({ title, children }) {
  return (
    <div className="flex flex-col items-start gap-4">
      <h3
        style={{ letterSpacing: "0.12em", fontSize: "0.65rem" }}
        className={headingClass}
      >
        {title}
      </h3>

      <nav className="flex flex-col items-start gap-2.5">
        {children}
      </nav>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      className="w-full border-t border-gray-800 bg-black px-6 pb-28 pt-10 text-white md:pb-6"
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');`}</style>

      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-6">
          <div className="col-span-2 flex flex-col items-center gap-3 sm:col-span-3 lg:col-span-1 lg:items-start">
            <Link to="/" aria-label="Mystery Mansion home">
              <img
                src={Logo}
                alt="Mystery Mansion Logo"
                className="h-14 w-auto"
              />
            </Link>

            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                letterSpacing: "0.04em",
              }}
              className="text-center text-lg font-bold leading-tight text-white lg:text-left"
            >
              Mystery Mansion
            </p>

            <p className="text-center text-xs text-gray-500 lg:text-left">
              © {year}. All rights reserved.
            </p>
          </div>

          <FooterSection title="Get Started">
            <Link to="/become-a-client" className={linkClass}>
              Become a Client
            </Link>

            <Link to="/become-a-provider" className={linkClass}>
              Become a Provider
            </Link>

            <Link to="*" className={linkClass}>
              Membership
            </Link>
          </FooterSection>

          <FooterSection title="Credits & Rewards">
            <Link to="/credits" className={linkClass}>
              Credits
            </Link>

            <Link to="/credit-packages" className={linkClass}>
              Credit Packages
            </Link>

            <Link to="/review-incentives" className={linkClass}>
              Review Incentives
            </Link>

            <Link to="/referrals" className={linkClass}>
              Referrals
            </Link>
          </FooterSection>

          <FooterSection title="Community">
            <Link to="/community-guidelines" className={linkClass}>
              Community Guidelines
            </Link>

            <Link to="/forum" className={linkClass}>
              Forums
            </Link>

            <Link to="/faq" className={linkClass}>
              FAQ
            </Link>

            <Link to="/milestones" className={linkClass}>
              Milestones
            </Link>
          </FooterSection>

          <FooterSection title="Legal">
            <Link to="/privacy-policy" className={linkClass}>
              Privacy Policy
            </Link>

            <Link to="/terms-policy" className={linkClass}>
              Terms of Service
            </Link>
          </FooterSection>

          <div className="flex flex-col items-start gap-5">
            <FooterSection title="Updates">
              <Link to="/platform-updates" className={linkClass}>
                Platform Updates
              </Link>
            </FooterSection>

            {FEATURE_FLAGS.ENABLE_FOLLOW_US && (
              <div className="flex flex-col items-start gap-3">
                <h3
                  style={{ letterSpacing: "0.12em", fontSize: "0.65rem" }}
                  className={headingClass}
                >
                  Follow Us
                </h3>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                  <span className="cursor-pointer transition-colors hover:text-pink-400">
                    Instagram
                  </span>

                  <span className="text-gray-700">·</span>

                  <span className="cursor-pointer transition-colors hover:text-pink-400">
                    Twitter
                  </span>

                  <span className="text-gray-700">·</span>

                  <span className="cursor-pointer transition-colors hover:text-pink-400">
                    LinkedIn
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="my-8 border-t border-gray-800" />

        <div className="flex flex-col items-center justify-between gap-4 text-center text-xs text-gray-600 sm:flex-row sm:text-left">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:gap-2">
            <p>
              Built with ❤️ for a safer experience. Designed by Mystery
              Mansion.
            </p>

            <span className="hidden sm:inline">|</span>

            <Link
              to="/contact"
              className="text-pink-400 underline underline-offset-2 transition-colors duration-200 hover:text-pink-300"
            >
              Contact Support
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span>Powered by</span>

            <a
              href="https://fantometechnologies.com"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-70 transition-opacity duration-200 hover:opacity-100"
            >
              <img
                src={Partners}
                alt="Fantome Technologies"
                className="h-5 w-auto"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}