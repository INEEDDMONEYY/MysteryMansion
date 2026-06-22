import { useRef } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import Logo from "@/assets/Logo2.png";
import { FEATURE_FLAGS } from "@/config/featureFlags.js";
import {
  ArrowUpRight,
  ChevronsRightLeft,
  User,
  FileUser,
  Contact,
  CircleUser
} from "lucide-react";

export default function Navbar() {
  const navRef = useRef();
  const navigate = useNavigate();

  const showNavbar = () => {
    navRef.current.classList.toggle("responsive_nav");
  };

  const handleProfileClick = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const role = user?.role;

    role === "admin"
      ? navigate("/admin")
      : role === "user"
      ? navigate("/user/dashboard")
      : navigate("/signin");
  };

  return (
    <header className="bg-black text-white flex justify-between items-center px-4 py-3 w-full shadow-md">
      {/* Logo */}
      <Link to="/home" className="flex items-center gap-2 min-w-0">
        <img src={Logo} alt="Logo" className="h-10 w-auto shrink-0" />
        <span className="text-sm sm:text-base md:text-lg font-semibold tracking-wide whitespace-nowrap">
          Mystery Mansion
        </span>
      </Link>

      {/* Navigation Links */}
      <nav
        ref={navRef}
        className={`nav-items flex-col md:flex-row md:flex gap-5 items-center absolute md:static top-16 left-0 w-full md:w-auto bg-black md:bg-transparent z-50 p-4 md:p-0 ${
          navRef.current?.classList.contains("responsive_nav")
            ? "flex"
            : "hidden md:flex"
        }`}
      >
        <Link to="/signin" className="flex items-center gap-1 hover:text-pink-400">
          <User size={18} /> Sign In
        </Link>

        <Link to="/signup" className="flex items-center gap-1 hover:text-pink-400">
          <FileUser size={18} /> Sign Up
        </Link>

        {/* ✔ FEATURE FLAG APPLIED HERE */}
        {FEATURE_FLAGS.ENABLE_PROMOTE_ACCOUNT_NAV && (
          <Link to="/promote" className="flex items-center gap-1 hover:text-pink-400">
            <Contact size={18} /> Promote Account
          </Link>
        )}

        <button
          onClick={handleProfileClick}
          className="flex items-center gap-1 hover:text-pink-400"
        >
          <CircleUser size={18} /> Profile
        </button>


        {/* Close button for mobile */}
        <button
          className="nav-btn nav-close-btn md:hidden text-white"
          onClick={showNavbar}
        >
          <ArrowUpRight />
        </button>
      </nav>

      {/* Open button for mobile */}
      <button
        className="nav-btn nav-open-btn md:hidden text-white"
        onClick={showNavbar}
      >
        <ChevronsRightLeft />
      </button>
    </header>
  );
}
