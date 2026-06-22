import { useEffect } from "react";
import { setSEO } from "@/shared/utils/seo";

// Future contact image (will appear inside the contact card area)
// Example later: const CONTACT_IMAGE = "/contact-support.jpg";
const CONTACT_IMAGE = "/mm-hero.png";

export default function ContactPage() {
  useEffect(() => {
    setSEO(
      "Contact Support | Mystery Mansion",
      "Contact Mystery Mansion support for help with your escort and sex work advertising account, safety concerns, and platform questions.",
      { robots: "index, follow", canonicalPath: "/contact" }
    );
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <section className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8 flex flex-col items-center text-center border border-gray-200">
          {/* Future Image Placement (inside card, not full background) */}
          {CONTACT_IMAGE && (
            <div className="w-full mb-5">
              <img
                src={CONTACT_IMAGE}
                alt="Contact Support"
                className="w-full h-40 sm:h-44 md:h-48 object-cover rounded-lg"
              />
            </div>
          )}

          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-pink-700">
            Contact Support
          </h1>

          <p className="text-gray-700 mb-6 text-sm sm:text-base md:text-lg">
            Need help or have questions? Reach out to our support team anytime.
          </p>

          <a
            href="mailto:support.mysterymansion@gmail.com"
            className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-3 rounded-lg text-sm sm:text-base transition mb-2 w-full sm:w-auto"
          >
            Email: support.mysterymansion@gmail.com
          </a>

          <p className="text-xs text-gray-500 mt-2">
            We aim to respond within 24 hours. Unless it is a promotion account issue, we will get back to you within 15 minutes.
          </p>
        </section>
      </main>
    </div>
  );
}