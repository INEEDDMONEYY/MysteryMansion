import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

import SignupForm from "../components/SignUpForm";
import EmailVerifyStep from "../components/EmailVerifyStep";
import Logo from "@/assets/Logo.png";

import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";
import { setSEO } from "@/shared/utils/seo";
import { storeReferralCode } from "@/shared/utils/referral";

function AccountTypeSelector({ onSelect }) {
  return (
    <div className="flex w-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex items-center justify-center gap-3">
          <img
            src={Logo}
            alt="Mystery Mansion"
            className="signin-logo"
          />

          <h1 className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-pink-300 bg-clip-text text-3xl font-bold text-transparent">
            Mystery Mansion
          </h1>
        </div>

        <h2 className="mb-2 text-center text-xl font-semibold bg-gradient-to-r from-pink-400 via-fuchsia-400 to-pink-300 bg-clip-text text-transparent">
          Create your account
        </h2>

        <p className="mb-8 text-center text-sm bg-gradient-to-r from-pink-300 via-fuchsia-300 to-pink-200 bg-clip-text text-transparent">
          Choose how you want to use Mystery Mansion
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onSelect("provider")}
            className="group relative flex cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-pink-500 bg-white/10 p-8 text-left backdrop-blur-sm transition-all hover:border-pink-400 hover:bg-pink-500/20"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/30 text-4xl transition-colors group-hover:bg-pink-500/50">
              💃
            </div>

            <div className="text-center">
              <h3 className="mb-1 text-xl font-bold text-white">
                I'm a Provider
              </h3>

              <p className="text-sm leading-relaxed text-gray-300">
                Create and manage listings, get discovered by clients, and
                grow your business on Mystery Mansion.
              </p>
            </div>

            <span className="mt-2 inline-block rounded-full bg-pink-500 px-5 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-pink-400">
              Sign up as Provider →
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelect("client")}
            className="group relative flex cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-purple-500 bg-white/10 p-8 text-left backdrop-blur-sm transition-all hover:border-purple-400 hover:bg-purple-500/20"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/30 text-4xl transition-colors group-hover:bg-purple-500/50">
              🕵️
            </div>

            <div className="text-center">
              <h3 className="mb-1 text-xl font-bold text-white">
                I'm a Client
              </h3>

              <p className="text-sm leading-relaxed text-gray-300">
                Browse provider listings, save your favourites, read reviews,
                and connect with providers.
              </p>
            </div>

            <span className="mt-2 inline-block rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-purple-500">
              Sign up as Client →
            </span>
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="text-pink-400 underline transition hover:text-pink-300"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

function SignupFormStep({
  accountType,
  verifiedEmail,
  verificationToken,
  onBack,
}) {
  const label =
    accountType === "provider" ? "Provider" : "Client";

  const accent =
    accountType === "provider"
      ? "border-pink-500"
      : "border-purple-500";

  const badgeColor =
    accountType === "provider"
      ? "bg-pink-500/20 text-pink-300 border-pink-500/40"
      : "bg-purple-500/20 text-purple-300 border-purple-500/40";

  return (
    <div className="flex w-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div
        className={`form-bg mx-auto w-full max-w-sm rounded-lg border-t-4 bg-gray-300 p-4 text-center ${accent}`}
      >
        <div className="flex items-center justify-center gap-2 text-center">
          <h1 className="text-center text-2xl text-black sm:text-[2rem]">
            Mystery Mansion
          </h1>

          <img
            src={Logo}
            alt="Mystery Mansion"
            className="signin-logo"
          />
        </div>

        <span
          className={`mb-3 inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badgeColor}`}
        >
          {label} Account
        </span>

        <h3 className="text-2xl text-black sm:text-[2rem]">
          Sign Up
        </h3>

        <div className="w-full">
          <SignupForm
            accountType={accountType}
            verifiedEmail={verifiedEmail}
            verificationToken={verificationToken}
          />
        </div>

        <button
          type="button"
          onClick={onBack}
          className="mt-3 text-sm text-gray-600 underline transition hover:text-gray-900"
        >
          ← Change account type
        </button>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const typeParam = searchParams.get("type");

  const [accountType, setAccountType] = useState(
    typeParam === "provider" || typeParam === "client"
      ? typeParam
      : null
  );

  const [verifiedEmail, setVerifiedEmail] =
    useState(null);

  const [verificationToken, setVerificationToken] =
    useState(null);

  useEffect(() => {
    setSEO("Sign Up | Mystery Mansion", "", {
      robots: "noindex, nofollow",
    });
  }, []);

  // Carry a `?ref=CODE` referral code (e.g. shared directly, without visiting
  // the /referral/:code landing page) through to the signup request.
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) storeReferralCode(ref);
  }, [searchParams]);

  const handleSelect = (type) => {
    setAccountType(type);
    setSearchParams({ type });

    setVerifiedEmail(null);
    setVerificationToken(null);
  };

  const handleBack = () => {
    setAccountType(null);
    setSearchParams({});

    setVerifiedEmail(null);
    setVerificationToken(null);
  };

  const handleVerified = ({
    email,
    verificationToken: token,
  }) => {
    setVerifiedEmail(email);
    setVerificationToken(token);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="signup-bg absolute inset-0 scale-105 blur-[3px]" />

        <div className="absolute inset-0 bg-black/45" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/55" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />

        <main className="flex flex-1">
          {!accountType && (
            <AccountTypeSelector onSelect={handleSelect} />
          )}

          {accountType && !verifiedEmail && (
            <div className="flex w-full flex-1">
              <EmailVerifyStep
                accountType={accountType}
                onVerified={handleVerified}
                onBack={handleBack}
              />
            </div>
          )}

          {accountType && verifiedEmail && (
            <SignupFormStep
              accountType={accountType}
              verifiedEmail={verifiedEmail}
              verificationToken={verificationToken}
              onBack={() => {
                setVerifiedEmail(null);
                setVerificationToken(null);
              }}
            />
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}