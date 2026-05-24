import { Link } from 'react-router-dom';

// Standard page header used by every tool page: title + subtitle on the left,
// optional Back link or custom actions on the right. Pass `backTo` for the
// "← Back" link (most tool pages), or `actions` for a custom right-hand
// cluster (Profile uses this for its New/Edit/Rename/Delete buttons).
export default function ToolPageHeader({
  title,
  subtitle,
  backTo,
  actions,
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="h-page">{title}</h1>
        {subtitle && <p className="mt-1 text-subtle">{subtitle}</p>}
      </div>
      {(actions || backTo) && (
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          {backTo && (
            <Link to={backTo} className="btn-secondary">
              <span aria-hidden="true">←</span> Back
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
