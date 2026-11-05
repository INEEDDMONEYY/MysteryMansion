// src/components/Toasts/HomeToasts/PolicyToast.jsx
import React, { useState, useEffect } from "react";

export default function PolicyToast({ onOk }) {
  const [showToast, setShowToast] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("policyToastDismissed");
    if (!dismissed) {
      setShowToast(true); // show only if not dismissed this session
      setTimeout(() => setAnimate(true), 10); // fade-in
    }
  }, []);

  const handleOk = () => {
    setAnimate(false); // fade-out
    setTimeout(() => {
      setShowToast(false);
      sessionStorage.setItem("policyToastDismissed", "true"); // ✅ session-only
      if (onOk) onOk(); // trigger AgeRequirementToast
    }, 300);
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
            Before you continue
          </p>
          <h2 className="mt-1 text-xl font-bold">Community Guidelines</h2>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm leading-relaxed text-gray-300">
            Please keep interactions respectful, avoid harmful content, and
            follow our community rules. Violations may result in content removal
            or account restrictions.
          </p>
          <button
            type="button"
            onClick={handleOk}
            className="mt-6 w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-200"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

