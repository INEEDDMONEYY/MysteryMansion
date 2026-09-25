import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Link, useLocation } from "react-router-dom";
import Logo from "@/assets/Logo2.png";
import { FEATURE_FLAGS } from "@/config/featureFlags.js";
import { useUser } from "@/context/useUser";
import api from "@/shared/utils/api";
import {
  Home,
  User,
  FileUser,
  Contact,
  CircleUser,
  Bell,
  MessageCircle,
  CirclePlus,
  CreditCard,
  BarChart3
} from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const isAdmin = user?.role === "admin";
  const isProvider = user?.role === "user" && user?.accountType === "provider";
  const isClient = user?.role === "user" && user?.accountType === "client";

  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Poll unread counts for the role-linked bottom-nav badges (logged-out users skip this).
  useEffect(() => {
    if (!user?._id) {
      setUnreadNotifications(0);
      setUnreadMessages(0);
      return;
    }

    let active = true;
    const notificationsEndpoint = isAdmin ? "/notifications" : "/notifications/user";

    const fetchCounts = async () => {
      const [notifResult, messagesResult] = await Promise.allSettled([
        api.get(notificationsEndpoint),
        api.get("/messages/unread/count"),
      ]);
      if (!active) return;

      setUnreadNotifications(
        notifResult.status === "fulfilled" ? Number(notifResult.value.data?.unreadCount) || 0 : 0
      );
      setUnreadMessages(
        messagesResult.status === "fulfilled" ? Number(messagesResult.value.data?.unreadCount) || 0 : 0
      );
    };

    fetchCounts();
    const id = setInterval(fetchCounts, 30_000);
    return () => { active = false; clearInterval(id); };
  }, [user?._id, isAdmin]);

  const handleProfileClick = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const { role, accountType } = user;

    if (role === "admin") return navigate("/admin");
    if (role === "user") {
      return navigate(accountType === "client" ? "/client/dashboard" : "/user/dashboard");
    }
    navigate("/signin");
  };

  // Bottom bar items for mobile; desktop keeps the inline header links below.
  let mobileNavItems;
  if (isAdmin) {
    mobileNavItems = [
      { key: "home", label: "Home", icon: Home, to: "/", match: (p) => p === "/" },
      { key: "analytics", label: "Analytics", icon: BarChart3, to: "/admin/analytics" },
      { key: "notifications", label: "Notifications", icon: Bell, to: "/admin/notifications", badge: unreadNotifications },
      { key: "messages", label: "Messages", icon: MessageCircle, to: "/admin/messages", badge: unreadMessages },
      {
        key: "profile",
        label: "Profile",
        icon: CircleUser,
        onClick: handleProfileClick,
        match: (p) =>
          p.startsWith("/admin") &&
          !p.startsWith("/admin/analytics") &&
          !p.startsWith("/admin/notifications") &&
          !p.startsWith("/admin/messages"),
      },
    ];
  } else if (isProvider) {
    mobileNavItems = [
      { key: "home", label: "Home", icon: Home, to: "/", match: (p) => p === "/" },
      { key: "notifications", label: "Notifications", icon: Bell, to: "/user/notifications", badge: unreadNotifications },
      { key: "post", label: "Post", icon: CirclePlus, to: "/post", center: true },
      { key: "messages", label: "Messages", icon: MessageCircle, to: "/user/messages", badge: unreadMessages },
      {
        key: "profile",
        label: "Profile",
        icon: CircleUser,
        onClick: handleProfileClick,
        match: (p) =>
          p.startsWith("/user") && !p.startsWith("/user/notifications") && !p.startsWith("/user/messages"),
      },
    ];
  } else if (isClient) {
    mobileNavItems = [
      { key: "home", label: "Home", icon: Home, to: "/", match: (p) => p === "/" },
      { key: "notifications", label: "Notifications", icon: Bell, to: "/client/notifications", badge: unreadNotifications },
      { key: "messages", label: "Messages", icon: MessageCircle, to: "/client/messages", badge: unreadMessages },
      { key: "credits", label: "Credits", icon: CreditCard, to: "/client/credits" },
      {
        key: "profile",
        label: "Profile",
        icon: CircleUser,
        onClick: handleProfileClick,
        match: (p) =>
          p.startsWith("/client") &&
          !p.startsWith("/client/notifications") &&
          !p.startsWith("/client/messages") &&
          !p.startsWith("/client/credits"),
      },
    ];
  } else {
    mobileNavItems = [
      { key: "home", label: "Home", icon: Home, to: "/", match: (p) => p === "/" },
      { key: "faq", label: "FAQ", icon: User, to: "/faq" },
      { key: "referrals", label: "Referrals", icon: FileUser, to: "/referrals" },
      FEATURE_FLAGS.ENABLE_PROMOTE_ACCOUNT_NAV && {
        key: "support",
        label: "Support",
        icon: Contact,
        to: "/contact",
      },
      {
        key: "profile",
        label: "Profile",
        icon: CircleUser,
        onClick: handleProfileClick,
        match: (p) => p.startsWith("/admin") || p.startsWith("/user") || p.startsWith("/client"),
      },
    ].filter(Boolean);
  }

  return (
    <header className="bg-black text-white flex justify-between items-center px-4 py-3 w-full shadow-md">
      {/* Logo */}
      <Link to="/home" className="flex items-center gap-2 min-w-0">
        <img src={Logo} alt="Logo" className="h-10 w-auto shrink-0" />
        <span className="text-sm sm:text-base md:text-lg font-semibold tracking-wide whitespace-nowrap">
          Mystery Mansion
        </span>
      </Link>

      {/* Navigation Links (desktop) */}
      <nav className="nav-items hidden md:flex gap-5 items-center">
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
      </nav>

      {/* Floating bottom navigation (mobile only) */}
      <nav className="md:hidden fixed inset-x-0 bottom-0 z-50">
        <ul
          className={`grid items-center bg-gradient-to-r from-white to-pink-200 shadow-lg px-2 py-2 ${
            { 4: "grid-cols-4", 5: "grid-cols-5" }[mobileNavItems.length] || "grid-cols-5"
          }`}
        >
          {mobileNavItems.map(({ key, label, icon: Icon, to, onClick, match, center, badge }) => {
            const active = match ? match(location.pathname) : location.pathname === to;
            const elevated = center || active;
            const badgeLabel = badge > 0 ? (badge > 9 ? "9+" : badge) : null;
            const itemBody = (
              <>
                {elevated ? (
                  <span
                    className={`absolute -top-8 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg ring-4 ring-white ${
                      center ? "bg-gradient-to-br from-pink-500 to-fuchsia-600" : "bg-pink-500"
                    }`}
                  >
                    <Icon size={22} />
                    {badgeLabel && (
                      <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-0.5 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none ring-2 ring-white">
                        {badgeLabel}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="relative inline-flex">
                    <Icon size={18} className="text-neutral-500" />
                    {badgeLabel && (
                      <span className="absolute -top-1.5 -right-2 h-4 min-w-[16px] px-0.5 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                        {badgeLabel}
                      </span>
                    )}
                  </span>
                )}
                <span
                  className={`mt-1 text-[11px] ${
                    elevated ? "font-semibold text-black" : "text-neutral-500"
                  }`}
                >
                  {label}
                </span>
              </>
            );

            const itemClass =
              "relative flex h-14 w-full flex-col items-center justify-end gap-0";

            return (
              <li key={key}>
                {to ? (
                  <Link to={to} className={itemClass}>
                    {itemBody}
                  </Link>
                ) : (
                  <button type="button" onClick={onClick} className={itemClass}>
                    {itemBody}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
