import { useEffect, useState } from "react";
import BrandLoader from "./BrandLoader";

export default function SigninLoader() {
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 60000); // ⏱️ 1 minute

    return () => clearTimeout(timer);
  }, []);

  if (timeoutReached) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-10 text-center text-gray-500">
        <div className="text-sm sm:text-base text-red-400">
          Sign-in is taking longer than expected. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-full flex flex-col items-center justify-center py-10 text-center text-gray-500">
      <BrandLoader size="md" label="Signing you in..." className="!py-0" />
    </div>
  );
}
