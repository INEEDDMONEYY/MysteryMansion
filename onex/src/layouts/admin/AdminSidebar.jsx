import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  BarChart2,
  Settings,
  Mail,
  UserPlus,
  LogOut,
  ArrowLeftCircle,
  Crown,
  Megaphone,
  Percent,
  Bell,
  MailCheck,
  Coins,
  HelpCircle,
} from 'lucide-react';
import { useUser } from '@/context/useUser';

const ADMIN_NAV = [
  { to: '/admin',                 label: 'Dashboard',    icon: Home,      end: true },
  { to: '/admin/users',           label: 'User Mgmt',    icon: Users },
  { to: '/admin/create-user',     label: 'Create Users', icon: UserPlus },
  { to: '/admin/analytics',       label: 'Analytics',    icon: BarChart2 },
  { to: '/admin/messages',        label: 'Messages',     icon: Mail },
  { to: '/admin/banners',         label: 'Banners',      icon: Megaphone },
  { to: '/admin/discounts',       label: 'Discounts',    icon: Percent },
  { to: '/admin/notifications',   label: 'Notifications',icon: Bell },
  { to: '/admin/email-users',     label: 'Email Users',     icon: MailCheck },
  { to: '/admin/credit-requests', label: 'Credit Requests', icon: Coins },
  { to: '/admin/credit-packages', label: 'Credit Packages', icon: Coins },
  { to: '/admin/faqs',            label: 'FAQ',             icon: HelpCircle },
  { to: '/admin/settings',        label: 'Settings',        icon: Settings },
];

export default function AdminSidebar({
  isOpen,
  onClose,
  unreadMessages = 0,
}) {
  const navigate = useNavigate();
  const { user } = useUser();

  const profilePicSrc =
    localStorage.getItem('profilePicture') ||
    user?.profilePic ||
    '';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('profilePicture');

    navigate('/');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="
            fixed inset-0 z-40
            bg-black/60
            backdrop-blur-sm
            lg:hidden
          "
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen
          w-[280px]
          bg-neutral-950
          border-r border-neutral-800
          flex flex-col
          px-4 py-6

          transition-transform
          duration-300

          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            {profilePicSrc ? (
              <img
                src={profilePicSrc}
                alt="Admin"
                className="
                  h-12 w-12
                  rounded-2xl
                  object-cover
                  border border-neutral-800
                "
              />
            ) : (
              <div
                className="
                  h-12 w-12
                  rounded-2xl
                  bg-neutral-900
                  border border-neutral-800
                "
              />
            )}

            <div>
              <h2 className="text-white font-semibold">
                Mystery Mansion
              </h2>

              <p className="text-xs text-neutral-500">
                Admin Control Center
              </p>
            </div>
          </div>
        </div>

        {/* Navigation + Promo Card — scrollable so footer always stays visible */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-0.5">
        <nav className="space-y-2">
          {ADMIN_NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `
                  group
                  flex items-center
                  gap-3
                  px-4 py-3
                  rounded-xl

                  transition-all
                  duration-200

                  ${
                    isActive
                      ? `
                        bg-neutral-900
                        border border-neutral-800
                        text-white
                      `
                      : `
                        text-neutral-400
                        hover:text-white
                        hover:bg-neutral-900/60
                      `
                  }
                `
              }
            >
              <Icon
                size={18}
                className="shrink-0"
              />

              <span className="text-sm font-medium">
                {label}
              </span>

              {label === 'Messages' &&
                unreadMessages > 0 && (
                  <span
                    className="
                      ml-auto
                      min-w-[22px]
                      h-[22px]

                      rounded-full
                      bg-rose-500
                      text-white
                      text-xs

                      flex items-center
                      justify-center
                    "
                  >
                    {unreadMessages}
                  </span>
                )}
            </NavLink>
          ))}
        </nav>

        {/* Promotion Card */}
        <div className="mt-8">
          <div
            className="
              rounded-3xl
              border border-neutral-800
              bg-neutral-900
              p-5
            "
          >
            <div className="flex items-center gap-2 mb-3">
              <Crown
                size={18}
                className="text-amber-400"
              />

              <span className="text-white font-medium">
                Promotion Center
              </span>
            </div>

            <p className="text-sm text-neutral-400 leading-relaxed">
              Manage featured listings,
              homepage visibility,
              and provider promotion tools.
            </p>

            <button
              type="button"
              className="
                mt-4
                w-full

                rounded-xl
                border border-neutral-700

                bg-neutral-800
                text-white

                px-4 py-2.5
                text-sm

                hover:bg-neutral-700
                transition-colors
              "
            >
              Open Promotions
            </button>
          </div>
        </div>
        </div>{/* end scrollable middle */}

        {/* Footer */}
        <div className="pt-4 space-y-2 border-t border-neutral-800 mt-2">
          <button
            onClick={() => navigate('/')}
            className="
              w-full
              flex items-center
              gap-3

              px-4 py-3
              rounded-xl

              text-neutral-400
              hover:text-white
              hover:bg-neutral-900

              transition-all
            "
          >
            <ArrowLeftCircle size={18} />
            <span>Go To Site</span>
          </button>

          <button
            onClick={handleLogout}
            className="
              w-full
              flex items-center
              gap-3

              px-4 py-3
              rounded-xl

              text-red-400
              hover:bg-red-500/10

              transition-all
            "
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}