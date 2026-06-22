/**
 * DashboardSidebar — shared sidebar shell used by both AdminSidebar & UserSidebar.
 *
 * Structure (identical for admin + user, only props differ):
 *   ┌──────────────────┐
 *   │  Brand / Avatar  │  ← brand prop
 *   ├──────────────────┤
 *   │  Nav items       │  ← navItems prop
 *   ├──────────────────┤
 *   │  Extra slot      │  ← extraNav prop  (feature-flagged items, etc.)
 *   ├──────────────────┤
 *   │  Footer actions  │  ← footerActions prop
 *   └──────────────────┘
 *
 * Props:
 *   variant       — 'admin' | 'user'   adds a BEM modifier for theming
 *   isOpen        — bool               mobile drawer state
 *   onClose       — fn()               close the drawer
 *   brand         — { label, avatarSrc, avatarAlt }
 *   navItems      — NavItem[]          see type below
 *   extraNav      — ReactNode          optional slot after navItems (feature flags etc.)
 *   footerActions — FooterAction[]     see type below
 *
 * NavItem: { to, label, icon: LucideIcon, end?: bool, badge?: number }
 * FooterAction: { label, icon: LucideIcon, onClick: fn, danger?: bool }
 */
import { NavLink } from 'react-router-dom';

export default function DashboardSidebar({
  variant = 'user',
  isOpen = false,
  onClose,
  brand = {},
  navItems = [],
  extraNav,
  footerActions = [],
}) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[280px] flex flex-col bg-white border-r border-gray-200 transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        aria-label={`${variant === 'admin' ? 'Admin' : 'User'} navigation`}
      >
        {/* ── Brand / profile row ── */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          {brand.avatarSrc && (
            <img
              src={brand.avatarSrc}
              alt={brand.avatarAlt ?? 'Avatar'}
              className="w-9 h-9 rounded-full object-cover shrink-0"
            />
          )}
          <span className="text-gray-900 font-semibold text-sm truncate">{brand.label}</span>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-pink-600 text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {Icon && <Icon size={18} aria-hidden="true" className="shrink-0" />}
              <span className="flex-1">{label}</span>
              {typeof badge === 'number' && (
                <span
                  className={`min-w-5 text-center rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                    badge > 0 ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                  aria-label={`${badge} unread`}
                >
                  {badge}
                </span>
              )}
            </NavLink>
          ))}

          {/* Optional extra nav slot */}
          {extraNav}
        </nav>

        {/* ── Footer actions ── */}
        <div className="px-3 py-4 border-t border-gray-200 space-y-1">
          {footerActions.map(({ label, icon: Icon, onClick, danger }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                danger
                  ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {Icon && <Icon size={18} aria-hidden="true" className="shrink-0" />}
              <span>{label}</span>
            </button>
          ))}
        </div>

      </aside>
    </>
  );
}
