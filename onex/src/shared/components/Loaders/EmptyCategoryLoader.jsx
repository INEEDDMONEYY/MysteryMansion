import { useEffect, useState } from "react";
import BrandLoader from "./BrandLoader";

export default function EmptyCategoryLoader() {
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 20000); // 20 seconds

    return () => clearTimeout(timer);
  }, []);

  if (timeoutReached) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-10 text-center text-gray-500">
        <div className="text-sm sm:text-base text-red-400">
          <p>There aren't any posts in this state/region yet.<br /><span className="text-green-700">Be the first to post 🙌</span></p>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-full flex flex-col items-center justify-center py-10 text-center text-gray-500">
      <BrandLoader size="md" label="Loading listings..." className="!py-0" />
    </div>
  );
}
