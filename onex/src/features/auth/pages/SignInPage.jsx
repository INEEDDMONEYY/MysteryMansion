import { useEffect, useState } from "react";

import SignInForm from "../components/SignInForm";
import SigninLogo from "@/assets/Logo.png";
import SigninLoader from "@/shared/components/Loaders/SigninLoader";

import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";
import { setSEO } from "@/shared/utils/seo";

export default function SignIn() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSEO("Sign In | Mystery Mansion", "", {
      robots: "noindex, nofollow",
    });
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="signin-bg absolute inset-0 scale-105 blur-[3px]" />

        <div className="absolute inset-0 bg-black/45" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/55" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />

        <main className="relative flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          {loading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <SigninLoader />
            </div>
          )}

          <div className="form-bg mx-auto w-full max-w-sm rounded-lg bg-gray-300 p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-center">
              <h1 className="text-center text-2xl text-black sm:text-[2rem]">
                Mystery Mansion
              </h1>

              <img
                src={SigninLogo}
                alt="Mystery Mansion"
                className="signin-logo"
              />
            </div>

            <h3 className="text-2xl text-black sm:text-[2rem]">
              Sign In
            </h3>

            <p className="text-base text-black sm:text-[1.2rem]">
              Sign into your account to continue to please,
              pleasure, promote your sex lifestyle!
            </p>

            <div className="w-full">
              <SignInForm setLoading={setLoading} />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}