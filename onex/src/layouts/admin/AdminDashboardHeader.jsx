import { useRef, useState, useEffect } from 'react';
import { Menu, Bell, Search, Settings, User, ImageIcon, Crown, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/useUser';
import useNotifications from '@/shared/hooks/useNotifications';
import NotificationModal from '@/shared/components/Notifications/NotificationModal';

const PROFILE_MENU = [
  { label: 'Profile Settings',     icon: ImageIcon, to: '/admin/settings' },
  { label: 'View Profile',         icon: User,      to: null }, // dynamic — uses username
  { label: 'Account Settings',     icon: Settings,  to: '/admin/settings' },
  { label: 'Promotion Settings',   icon: Crown,     to: '/admin/users' },
];

export default function AdminDashboardHeader({
  title,
  menuOpen,
  onMenuToggle,
}) {
  const { user } = useUser();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bellOpen, setBellOpen]         = useState(false);
  const dropdownRef = useRef(null);
  const bellRef     = useRef(null);

  const { notifications, unreadCount, loading, markAllRead, markOneRead } =
    useNotifications('admin');

  const profilePic =
    localStorage.getItem('profilePicture') ||
    user?.profilePic ||
    '';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMenuClick = (item) => {
    setDropdownOpen(false);
    if (item.label === 'View Profile' && user?.username) {
      navigate(`/profile/${user.username}`);
    } else if (item.to) {
      navigate(item.to);
    }
  };

  return (
    <header
      className="
        sticky top-0 z-30
        bg-neutral-950/90
        backdrop-blur-xl
        border-b border-neutral-800
      "
    >
      <div
        className="
          flex items-center justify-between
          px-4 md:px-6
          py-3
          gap-3
        "
      >
        {/* Left — hamburger + title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuToggle}
            className="
              lg:hidden shrink-0
              h-10 w-10
              rounded-xl
              border border-neutral-800
              bg-neutral-900
              flex items-center justify-center
              text-neutral-300
            "
          >
            <Menu size={18} />
          </button>

          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-semibold text-white truncate">{title}</h1>
            <p className="text-xs text-neutral-500 hidden sm:block">Welcome back</p>
          </div>
        </div>

        {/* Right — search + bell + profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search — desktop only */}
          <div className="hidden md:flex items-center gap-2 min-w-[220px] lg:min-w-[280px] rounded-2xl border border-neutral-800 bg-neutral-900 px-3 py-2">
            <Search size={14} className="text-neutral-500 shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none w-full text-sm text-white placeholder:text-neutral-500"
            />
          </div>

          {/* Bell */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setBellOpen((o) => !o)}
              className="relative h-10 w-10 rounded-2xl border border-neutral-800 bg-neutral-900 flex items-center justify-center text-neutral-300 hover:text-white transition-colors"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-0.5 flex items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <NotificationModal
              open={bellOpen}
              onClose={() => setBellOpen(false)}
              notifications={notifications}
              unreadCount={unreadCount}
              loading={loading}
              markAllRead={markAllRead}
              markOneRead={markOneRead}
              title="Admin Notifications"
              viewAllHref="/admin/notifications"
            />
          </div>

          {/* Profile card with dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="
                flex items-center gap-2
                rounded-2xl
                border border-neutral-800
                bg-neutral-900
                px-3 py-2
                hover:bg-neutral-800
                transition-colors
              "
            >
              {profilePic ? (
                <img src={profilePic} alt={user?.username} className="h-8 w-8 rounded-xl object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-xl bg-neutral-800" />
              )}

              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-white leading-none">{user?.username || 'Admin'}</p>
                <p className="text-xs text-neutral-500 mt-0.5">Administrator</p>
              </div>

              <ChevronDown
                size={14}
                className={`text-neutral-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="
                absolute right-0 top-full mt-2
                w-52
                bg-neutral-900
                border border-neutral-800
                rounded-2xl
                shadow-xl shadow-black/40
                overflow-hidden
                z-50
              ">
                {PROFILE_MENU.map(({ label, icon: Icon, to }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleMenuClick({ label, to })}
                    className="
                      w-full flex items-center gap-3
                      px-4 py-3
                      text-sm text-neutral-300
                      hover:bg-neutral-800 hover:text-white
                      transition-colors text-left
                    "
                  >
                    <Icon size={15} className="text-neutral-500 shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

