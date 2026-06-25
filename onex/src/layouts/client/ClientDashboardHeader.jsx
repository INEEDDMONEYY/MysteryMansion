import { useRef, useState, useEffect } from 'react';
import { Menu, Settings, User, ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '@/context/UserContext';
import UserNotificationBell from '@/shared/components/Notifications/UserNotificationBell';

export default function ClientDashboardHeader({ title, menuOpen, onMenuToggle }) {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const profilePic =
    localStorage.getItem('profilePicture') ||
    user?.profilePic ||
    '';

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    navigate('/signout');
    await logout?.();
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 gap-3">

        {/* Left — hamburger + title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onMenuToggle}
            className="lg:hidden shrink-0 h-10 w-10 rounded-xl border border-slate-700 bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <Menu size={18} />
          </button>

          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-semibold text-white truncate">{title}</h1>
            <p className="text-xs text-slate-500 hidden sm:block">Client Dashboard</p>
          </div>
        </div>

        {/* Right — notifications + profile */}
        <div className="flex items-center gap-2 shrink-0">
          <UserNotificationBell viewAllHref="/client/notifications" messagesPath="/client/messages" creditsPath="/client/credits" />

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 hover:bg-slate-700 transition-colors"
            >
              {profilePic ? (
                <img src={profilePic} alt={user?.username} className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-slate-700 flex items-center justify-center text-slate-400">
                  <User size={16} />
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-white leading-none">{user?.username || 'Client'}</p>
                <p className="text-xs text-slate-500 mt-0.5">Client</p>
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                <button
                  type="button"
                  onClick={() => { setDropdownOpen(false); navigate('/client/profile'); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <Settings size={15} className="text-gray-400 shrink-0" />
                  Profile Settings
                </button>
                {user?.username && (
                  <button
                    type="button"
                    onClick={() => { setDropdownOpen(false); navigate('/client/profile'); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                  >
                    <User size={15} className="text-gray-400 shrink-0" />
                    View Profile
                  </button>
                )}
                <div className="border-t border-gray-100" />
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut size={15} className="text-red-400 shrink-0" />
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
