// src/components/Toasts/HomeToasts/AgeRequirementToast.jsx
import React, { useState, useEffect } from "react";

export default function AgeRequirementToast({ onOk }) {
  const [showToast, setShowToast] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("ageRequirementToastDismissed");
    if (!dismissed) {
      setShowToast(true); // show only if not dismissed this session
      setTimeout(() => setAnimate(true), 10); // fade-in
    }
  }, []);

  const handleYes = () => {
    setAnimate(false); // fade-out
    setTimeout(() => {
      setShowToast(false);
      sessionStorage.setItem("ageRequirementToastDismissed", "true"); // ✅ session-only
      if (onOk) onOk();
    }, 300);
  };

  const handleNo = () => {
    window.location.href = "https://www.isittruenews.com/";
  };

  if (!showToast) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className={`w-full max-w-md overflow-hidden rounded-2xl border border-gray-800 bg-black text-white shadow-2xl transition-all duration-300 ${
          animate ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"
        }`}
      >
        <div className="border-b border-gray-800 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Age Verification
          </p>
          <h2 className="mt-1 text-xl font-bold">Are you of age?</h2>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm leading-relaxed text-gray-300">
            By using this site, you confirm that you are at least 18 years old
            (or meet your region’s minimum age requirement).
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleNo}
              className="rounded-lg border border-gray-700 bg-transparent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-900"
            >
              No
            </button>
            <button
              type="button"
              onClick={handleYes}
              className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-200"
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
