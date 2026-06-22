import { useEffect, useState } from "react";
import { Loader2, LogOut } from "lucide-react";

export default function SignoutLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 60 * 1000; // 1 minute
    const interval = 1000; // update every second
    const steps = duration / interval;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 100 / steps;
        return next >= 100 ? 100 : next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-6">
      <div className="animate-spin text-pink-600">
        <Loader2 size={48} />
      </div>
      <h2 className="text-xl font-semibold text-pink-700">Signing you out...</h2>
      <p className="text-gray-600 text-sm max-w-md">
        Please wait while we securely log you out and clear your session.
      </p>
      <div className="w-full max-w-sm h-2 bg-pink-100 rounded overflow-hidden">
        <div
          className="h-full bg-pink-500 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-xs text-gray-500">{Math.round(progress)}%</div>
    </div>
  );
}
