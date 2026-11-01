import { NavLink } from "react-router-dom";

export default function DashboardSidebar({
  variant = "user",
  isOpen = false,
  onClose,
  brand = {},
  navItems = [],
  extraNav,
  footerActions = [],
}) {
  const isClient = variant === "client";

  const sidebarTheme = isClient
    ? "bg-white border-gray-200"
    : "bg-white border-gray-200";

  const brandBorder = isClient
    ? "border-gray-200"
    : "border-gray-200";

  const brandText = isClient
    ? "text-black"
    : "text-gray-900";

  const getNavClass = (isActive) => {
    if (isClient) {
      return `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
        isActive
          ? "bg-gray-100 text-black font-semibold shadow-[inset_3px_0_0_0_#000]"
          : "text-gray-600 hover:bg-gray-100 hover:text-black"
      }`;
    }

    return `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
      isActive
        ? "bg-pink-600 text-white font-medium"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;
  };

  const getBadgeClass = (badge, isActive) => {
    if (isClient) {
      return `min-w-5 text-center rounded-full px-1.5 py-0.5 text-xs font-semibold ${
        badge > 0
          ? "bg-black text-white"
          : "bg-gray-200 text-gray-600"
      }`;
    }

    return `min-w-5 text-center rounded-full px-1.5 py-0.5 text-xs font-semibold ${
      badge > 0
        ? "bg-pink-500 text-white"
        : "bg-gray-200 text-gray-500"
    }`;
  };

  const getFooterClass = (danger) => {
    if (isClient) {
      return danger
        ? "text-gray-800 hover:bg-gray-100 hover:text-black"
        : "text-gray-600 hover:bg-gray-100 hover:text-black";
    }

    return danger
      ? "text-red-600 hover:bg-red-50 hover:text-red-700"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col border-r transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
          ${sidebarTheme}`}
        aria-label={`${
          variant === "admin"
            ? "Admin"
            : isClient
              ? "Client"
              : "User"
        } navigation`}
      >
        <div
          className={`flex items-center gap-3 border-b px-6 py-5 ${brandBorder}`}
        >
          {brand.avatarSrc && (
            <img
              src={brand.avatarSrc}
              alt={brand.avatarAlt ?? "Avatar"}
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          )}

          <span
            className={`truncate text-sm font-semibold ${brandText}`}
          >
            {brand.label}
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) => getNavClass(isActive)}
            >
              {Icon && (
                <Icon
                  size={18}
                  aria-hidden="true"
                  className={`shrink-0 ${
                    isClient ? "text-black" : ""
                  }`}
                />
              )}

              <span className="flex-1">{label}</span>

              {typeof badge === "number" && (
                <span
                  className={getBadgeClass(badge)}
                  aria-label={`${badge} unread`}
                >
                  {badge}
                </span>
              )}
            </NavLink>
          ))}

          {extraNav}
        </nav>

        <div
          className={`space-y-1 border-t px-3 py-4 ${
            isClient ? "border-gray-200" : "border-gray-200"
          }`}
        >
          {footerActions.map(({ label, icon: Icon, onClick, danger }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${getFooterClass(
                danger
              )}`}
            >
              {Icon && (
                <Icon
                  size={18}
                  aria-hidden="true"
                  className={`shrink-0 ${
                    isClient ? "text-black" : ""
                  }`}
                />
              )}

              <span>{label}</span>
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}