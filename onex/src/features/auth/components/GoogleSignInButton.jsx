import { useEffect, useRef, useState } from "react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GSI_SRC = "https://accounts.google.com/gsi/client";

let gsiPromise = null;

const loadGoogleIdentity = () => {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (gsiPromise) return gsiPromise;

  gsiPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () =>
      window.google?.accounts?.id ? resolve(window.google) : reject(new Error("Google sign-in failed to load"));
    script.onerror = () => {
      gsiPromise = null;
      script.remove();
      reject(new Error("Google sign-in failed to load"));
    };
    document.head.appendChild(script);
  });

  return gsiPromise;
};

export const isGoogleSignInEnabled = Boolean(GOOGLE_CLIENT_ID);

/**
 * Renders Google's official "Continue with Google" button and hands the
 * returned ID token (credential) to `onCredential`.
 */
export default function GoogleSignInButton({ onCredential, onError, disabled = false }) {
  const containerRef = useRef(null);
  const callbackRef = useRef(onCredential);
  const errorRef = useRef(onError);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    callbackRef.current = onCredential;
    errorRef.current = onError;
  }, [onCredential, onError]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined;
    let cancelled = false;

    const render = (google) => {
      const container = containerRef.current;
      if (cancelled || !container) return;
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response?.credential) callbackRef.current?.(response.credential);
          else errorRef.current?.("Google sign-in was cancelled.");
        },
        ux_mode: "popup",
        context: "signin",
        itp_support: true,
      });
      container.innerHTML = "";
      google.accounts.id.renderButton(container, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        logo_alignment: "left",
        width: Math.min(Math.max(container.offsetWidth || 280, 200), 400),
      });
      setStatus("ready");
    };

    loadGoogleIdentity()
      .then(render)
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="m-1 flex flex-col items-center">
      <div
        ref={containerRef}
        className={`flex min-h-[44px] w-full justify-center ${disabled ? "pointer-events-none opacity-60" : ""}`}
        aria-busy={status === "loading"}
      />
      {status === "error" && (
        <p className="text-xs text-red-700">Google sign-in couldn't load. Check your connection or use email instead.</p>
      )}
    </div>
  );
}
