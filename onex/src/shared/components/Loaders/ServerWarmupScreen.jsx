import { useEffect, useState } from "react";
import BrandLoader from "./BrandLoader";

// Shown while the backend is waking up so pages never render with empty data.
export default function ServerWarmupScreen() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <BrandLoader fullScreen delay size="xl">
      {elapsed >= 4 && (
        <div className="mt-6 max-w-sm">
          <p className="text-base font-semibold text-gray-800">
            Getting everything ready…
          </p>
          <p className="mt-1 text-sm text-gray-500">
            The platform is starting up. This usually takes under a minute.
          </p>
          {elapsed >= 15 && (
            <p className="mt-3 text-xs text-gray-400">
              {elapsed}s elapsed — almost there, hang tight!
            </p>
          )}
        </div>
      )}
    </BrandLoader>
  );
}
