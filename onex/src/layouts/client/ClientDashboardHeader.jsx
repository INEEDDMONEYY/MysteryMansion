import { useRef, useState, useEffect, useContext } from "react";
import {
  Menu,
  Settings,
  User,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "@/context/UserContext";
import UserNotificationBell from "@/shared/components/Notifications/UserNotificationBell";

export default function ClientDashboardHeader({
  title,
  menuOpen,
  onMenuToggle,
}) {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const profilePic =
    localStorage.getItem("profilePicture") ||
    user?.profilePic ||
    "";

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    navigate("/signout");
    await logout?.();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">

        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-300 bg-gray-100 text-black transition-colors hover:bg-gray-200 lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <Menu size={18} className="text-black" />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-black md:text-xl">
              {title}
            </h1>

            <p className="hidden text-xs text-gray-500 sm:block">
              Client Dashboard
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <UserNotificationBell
            viewAllHref="/client/notifications"
            messagesPath="/client/messages"
            creditsPath="/client/credits"
            milestonesPath="/client/milestones"
            reportsPath="/client/reports"
          />

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((open) => !open)}
              aria-expanded={dropdownOpen}
              className="flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-3 py-2 transition-colors hover:bg-gray-200"
            >
              {profilePic ? (
                <img
                  src={profilePic}
                  alt={user?.username || "Client profile"}
                  className="h-8 w-8 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 text-black">
                  <User size={16} className="text-black" />
                </div>
              )}

              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium leading-none text-black">
                  {user?.username || "Client"}
                </p>

                <p className="mt-0.5 text-xs text-gray-500">
                  Client
                </p>
              </div>

              <ChevronDown
                size={14}
                className={`text-black transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/client/profile");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-800 transition-colors hover:bg-gray-100"
                >
                  <Settings
                    size={15}
                    className="shrink-0 text-black"
                  />
                  Profile Settings
                </button>

                {user?.username && (
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate(`/profile/${user.username}`);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-800 transition-colors hover:bg-gray-100"
                  >
                    <User
                      size={15}
                      className="shrink-0 text-black"
                    />
                    View Profile
                  </button>
                )}

                <div className="border-t border-gray-200" />

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-800 transition-colors hover:bg-gray-100"
                >
                  <LogOut
                    size={15}
                    className="shrink-0 text-black"
                  />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}