import PostForm from "../components/PostForm";
import Logo from "@/assets/Logo.png";

export default function PostPage() {
  return (
    <>
      <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-10">
        {/* 🌈 Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-rose-300 to-yellow-200 animate-gradientMove"></div>

        {/* 🩵 Subtle overlay for contrast */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>

        {/* 🧱 Content */}
        <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl bg-gray-100/90 rounded-2xl shadow-xl p-5 sm:p-8 text-center flex flex-col items-center z-10">
          {/* 🏠 Header Section */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-4">
            <h1 className="text-black text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
              Mystery Mansion
            </h1>
            <img
              src={Logo}
              alt="Mystery Mansion Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain"
            />
          </div>

          {/* 📣 Subheading */}
          <h3 className="text-black text-xl sm:text-2xl font-semibold mb-1">
            Post
          </h3>
          <p className="text-black text-sm sm:text-base md:text-lg mb-5">
            There&apos;s men waiting to hear from you!
          </p>

          {/* 🧩 Post Form */}
          <div className="w-full">
            <PostForm embedded />
          </div>
        </div>
      </div>
    </>
  );
}
