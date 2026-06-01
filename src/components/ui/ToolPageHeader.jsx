import { Link } from 'react-router-dom';
import {
  formatPageTitle,
  useDocumentMeta,
} from '../../hooks/useDocumentMeta.js';

// Standard page header used by every tool page: title + subtitle on the left,
// optional Back link or custom actions on the right. Pass `backTo` for the
// "← Back" link (most tool pages), or `actions` for a custom right-hand
// cluster (Profile uses this for its New/Edit/Rename/Delete buttons).
//
// Side-effect: sets document.title and the SEO meta tags for the route.
// `description` is the SEO description; if omitted, we fall back to the
// rendered subtitle when it's a string. Pages with a JSX subtitle (Squads)
// should pass `description` explicitly so the meta tags still get set.
export default function ToolPageHeader({
  title,
  subtitle,
  description,
  backTo,
  actions,
}) {
  useDocumentMeta({
    title: formatPageTitle(title),
    description:
      description ?? (typeof subtitle === 'string' ? subtitle : undefined),
  });

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
