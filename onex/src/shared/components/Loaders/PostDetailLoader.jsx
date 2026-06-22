import { useEffect, useState } from "react";

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
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 opacity-70 animate-bubble-pop" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 opacity-40 animate-bubble-pop delay-300" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 opacity-20 animate-bubble-pop delay-600" />
      </div>
      <div className="mt-4 text-sm sm:text-base animate-pulse">
        Loading post details...
      </div>
    </div>
  );
}
