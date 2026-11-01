import { useEffect, useState } from "react";
import BrandLoader from "./BrandLoader";

export default function PostDetailLoader() {
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 10000); // ⏱️ 10 seconds

    return () => clearTimeout(timer);
  }, []);

  if (timeoutReached) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-10 text-center text-gray-500">
        <div className="text-sm sm:text-base text-red-400">
          <p>This post detail isn't available in this state/region yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-full flex flex-col items-center justify-center py-10 text-center text-gray-500">
      <BrandLoader size="md" label="Loading post details..." className="!py-0" />
    </div>
  );
}
