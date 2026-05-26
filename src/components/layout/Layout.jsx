import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary.jsx';
import { ROUTES } from '../../routes.js';
import { SECTIONS, childrenOf, toolsInSection } from '../../tools.js';

const TOOLS_MENU_LABEL = 'Tools';

const toLink = (tool) => ({
  to: tool.path,
  label: tool.label,
  shortLabel: tool.shortLabel ?? tool.label,
  end: tool.end,
  children: childrenOf(tool.key).map((c) => ({
    to: c.path,
    label: c.label,
    shortLabel: c.shortLabel ?? c.label,
    end: c.end,
  })),
});

const profileTools = toolsInSection(SECTIONS.PROFILE).map(toLink);

// Top nav order: the index tool (Dashboard) first, then the Tools dropdown,
// then any remaining TOP tools alphabetically.
const topTools = toolsInSection(SECTIONS.TOP);
const indexTool = topTools.find((t) => t.index);
const trailingTopTools = topTools.filter((t) => !t.index);

const navItems = [
  ...(indexTool ? [{ type: 'link', ...toLink(indexTool) }] : []),
  { type: 'tools' },
  ...trailingTopTools.map((t) => ({ type: 'link', ...toLink(t) })),
];

function linkClass({ isActive }) {
  return [
    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-indigo-600 text-white shadow-sm'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white',
  ].join(' ');
}

function ToolsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();
  const isPathActive = (to) =>
    location.pathname === to || location.pathname.startsWith(`${to}/`);
  const isSectionActive = profileTools.some(
    (t) => isPathActive(t.to) || t.children.some((c) => isPathActive(c.to)),
  );

  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const buttonClass = [
    'inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    isSectionActive
      ? 'bg-indigo-600 text-white shadow-sm'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white',
  ].join(' ');

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className={buttonClass}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {TOOLS_MENU_LABEL}
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="h-3 w-3"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.24 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-10 mt-1 min-w-[12rem] overflow-hidden rounded-md border border-slate-700 bg-slate-800 shadow-xl ring-1 ring-black/20"
        >
          {profileTools.map((t) => {
            const active = isPathActive(t.to);
            return (
              <div key={t.to}>
                <Link
                  to={t.to}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={[
                    'block px-3 py-2 text-sm transition-colors',
                    active
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-200 hover:bg-slate-700 hover:text-white',
                  ].join(' ')}
                >
                  {t.label}
                </Link>
                {t.children.map((c) => {
                  const childActive = isPathActive(c.to);
                  return (
                    <Link
                      key={c.to}
                      to={c.to}
                      role="menuitem"
                      onClick={() => setOpen(false)}
                      className={[
                        'block py-1.5 pl-6 pr-3 text-xs transition-colors',
                        childActive
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white',
                      ].join(' ')}
                    >
                      {c.label}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <NavLink
            to={ROUTES.home}
            className="text-base font-semibold tracking-tight text-slate-100 transition-colors hover:text-indigo-300"
          >
            Palmon Tools
          </NavLink>
          <nav className="flex items-center gap-1">
            {navItems.map((item) =>
              item.type === 'tools' ? (
                <ToolsMenu key="tools" />
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={linkClass}
                >
                  {item.label}
                </NavLink>
              ),
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <ErrorBoundary key={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>

      <footer className="mt-6 border-t border-slate-800/80 bg-slate-900/40">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <nav
            aria-label="Footer"
            className="grid grid-cols-[2fr_1fr] gap-x-8 gap-y-4"
          >
            <div className="flex flex-col items-start gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                {TOOLS_MENU_LABEL}
              </span>
              <div
                className="grid w-full gap-x-3 gap-y-1"
                style={{
                  gridTemplateColumns: `repeat(${profileTools.length}, minmax(0, 1fr))`,
                }}
              >
                {profileTools.map((tool) => (
                  <div
                    key={tool.to}
                    className="flex flex-col items-start gap-1"
                  >
                    <NavLink
                      to={tool.to}
                      end={tool.end}
                      className={({ isActive }) =>
                        [
                          'text-xs font-medium transition-colors',
                          isActive
                            ? 'text-indigo-300'
                            : 'text-slate-300 hover:text-white',
                        ].join(' ')
                      }
                    >
                      {tool.shortLabel}
                    </NavLink>
                    {tool.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        end={child.end}
                        className={({ isActive }) =>
                          [
                            'text-[11px] transition-colors',
                            isActive
                              ? 'text-indigo-300'
                              : 'text-slate-500 hover:text-slate-200',
                          ].join(' ')
                        }
                      >
                        {child.shortLabel}
                      </NavLink>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-start gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Site
              </span>
              {topTools.map(toLink).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      'text-xs transition-colors',
                      isActive
                        ? 'text-indigo-300'
                        : 'text-slate-400 hover:text-slate-100',
                    ].join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
          <div className="mt-6 border-t border-slate-800 pt-4 text-center text-xs text-slate-500">
            <p>&copy; 2026 aeiti</p>
            <p className="mt-1">
              Fan-made tools for Palmon: Survival. Not affiliated with the
              game's publisher.
            </p>
            {import.meta.env.VITE_APP_VERSION && (
              <p className="mt-1 text-slate-600">
                v{import.meta.env.VITE_APP_VERSION}
                {import.meta.env.VITE_APP_BUILD &&
                  `.${import.meta.env.VITE_APP_BUILD}`}
              </p>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
