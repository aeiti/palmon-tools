import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

const tools = [
  { to: '/buildings', label: 'Buildings' },
  { to: '/inventory', label: 'Inventory' },
].sort((a, b) => a.label.localeCompare(b.label));

const navItems = [
  { type: 'link', to: '/', label: 'Home', end: true },
  { type: 'link', to: '/profile', label: 'Profile' },
  { type: 'tools' },
  { type: 'link', to: '/about', label: 'About' },
];

function linkClass({ isActive }) {
  return [
    'rounded px-3 py-1.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-indigo-600 text-white'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white',
  ].join(' ');
}

function ToolsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();
  const isToolsActive = tools.some(
    (t) =>
      location.pathname === t.to ||
      location.pathname.startsWith(`${t.to}/`),
  );

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

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
    'inline-flex items-center gap-1 rounded px-3 py-1.5 text-sm font-medium transition-colors',
    isToolsActive
      ? 'bg-indigo-600 text-white'
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
        Tools
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
          className="absolute right-0 z-10 mt-1 min-w-[12rem] overflow-hidden rounded-md border border-slate-700 bg-slate-800 shadow-lg ring-1 ring-black/20"
        >
          {tools.map((t) => {
            const active =
              location.pathname === t.to ||
              location.pathname.startsWith(`${t.to}/`);
            return (
              <Link
                key={t.to}
                to={t.to}
                role="menuitem"
                className={[
                  'block px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-200 hover:bg-slate-700 hover:text-white',
                ].join(' ')}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <NavLink
            to="/"
            className="text-base font-semibold text-slate-100 hover:text-indigo-300"
          >
            Palmon Tools
          </NavLink>
          <nav className="flex items-center gap-1">
            {navItems.map((item, i) =>
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
        <Outlet />
      </main>

      <footer className="mx-auto max-w-3xl px-4 py-6 text-center text-xs text-slate-500">
        <p>
          Fan-made tools for Palmon: Survival. Not affiliated with the game's
          publisher.
        </p>
        {import.meta.env.VITE_APP_VERSION && (
          <p className="mt-1 text-slate-600">
            v{import.meta.env.VITE_APP_VERSION}
          </p>
        )}
      </footer>
    </div>
  );
}
