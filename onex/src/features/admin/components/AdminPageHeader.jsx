/**
 * AdminPageHeader
 * Reusable header section for admin pages.
 * Shows a page title, optional subtitle, and optional action slot (e.g. a button).
 * Style during UI redesign.
 *
 * Props:
 *   title    — string, required
 *   subtitle — string, optional
 *   action   — ReactNode, optional (e.g. <button>Add User</button>)
 */
export default function AdminPageHeader({ title, subtitle, action }) {
  return (
    <header className="admin-page-header">
      <div className="admin-page-header__text">
        <h1 className="admin-page-header__title">{title}</h1>
        {subtitle && (
          <p className="admin-page-header__subtitle">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="admin-page-header__action">{action}</div>
      )}
    </header>
  );
}
