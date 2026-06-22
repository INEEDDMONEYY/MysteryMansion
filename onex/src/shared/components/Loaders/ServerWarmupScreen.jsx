import { useEffect, useState } from "react";

export default function ServerWarmupScreen() {
  const [elapsed, setElapsed] = useState(0);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const elapsedTimer = setInterval(() => setElapsed((s) => s + 1), 1000);
    const dotsTimer = setInterval(() =>
      setDots((d) => (d.length >= 3 ? "." : d + ".")), 500
    );
    return () => {
      clearInterval(elapsedTimer);
      clearInterval(dotsTimer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center px-6">
      {/* Animated bubbles */}
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 opacity-70 animate-ping" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 opacity-40 animate-ping [animation-delay:0.3s]" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 opacity-20 animate-ping [animation-delay:0.6s]" />
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Server is waking up{dots}
      </h2>
      <p className="text-sm text-gray-500 max-w-xs">
        We're on a free server tier — it needs a moment to start. This usually takes
        under 1 minute.
      </p>

      {elapsed >= 10 && (
        <p className="mt-4 text-xs text-gray-400">
          {elapsed}s elapsed — almost there, hang tight!
        </p>
      )}
    </div>
  );
}
