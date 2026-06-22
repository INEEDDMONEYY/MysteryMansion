import { Menu, X } from 'lucide-react';

export default function DashboardHeader({
  variant = 'user',
  title = 'Dashboard',
  menuOpen = false,
  onMenuToggle,
  middleSlot,
  rightSlot,
}) {
  const isAdmin = variant === 'admin';
  const bg = isAdmin ? 'bg-neutral-950/90 border-neutral-800' : 'bg-white border-gray-200';
  const titleColor = isAdmin ? 'text-white' : 'text-gray-900';
  const subColor = isAdmin ? 'text-neutral-500' : 'text-gray-400';
  const btnBg = isAdmin
    ? 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white'
    : 'border-gray-200 bg-gray-100 text-gray-600 hover:text-gray-900';

  return (
    <header className={`sticky top-0 z-30 backdrop-blur-xl border-b ${bg}`}>
      <div className="flex items-center justify-between px-4 md:px-6 py-3 gap-3">
        {/* Left — hamburger + title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onMenuToggle}
            className={`lg:hidden shrink-0 h-10 w-10 rounded-xl border flex items-center justify-center transition-colors ${btnBg}`}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="min-w-0">
            <h1 className={`text-lg md:text-xl font-semibold truncate ${titleColor}`}>{title}</h1>
            {middleSlot && <div className={`text-xs ${subColor} hidden sm:block`}>{middleSlot}</div>}
          </div>
        </div>

        {/* Right slot */}
        {rightSlot && (
          <div className="flex items-center gap-2 shrink-0">{rightSlot}</div>
        )}
      </div>
    </header>
  );
}
