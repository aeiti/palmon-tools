import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

const profileTools = [
  { to: '/buildings', label: 'Buildings' },
  { to: '/inventory', label: 'Inventory' },
  { to: '/palmon', label: 'Palmon' },
  { to: '/squads', label: 'Squads' },
].sort((a, b) => a.label.localeCompare(b.label));

const navItems = [
  { type: 'link', to: '/', label: 'Home', end: true },
  { type: 'profile' },
  { type: 'link', to: '/about', label: 'About' },
];

const footerColumns = [
  { header: { to: '/', label: 'Home', end: true }, items: [] },
  { header: { to: '/profile', label: 'Profile' }, items: profileTools },
  { header: { to: '/about', label: 'About' }, items: [] },
];

function linkClass({ isActive }) {
  return [
    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-indigo-600 text-white shadow-sm'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white',
  ].join(' ');
}

function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();
  const menuItems = [
    { to: '/profile', label: 'Profile' },
    ...profileTools,
  ];
  const isProfileSectionActive = menuItems.some(
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
    'inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    isProfileSectionActive
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
        Profile
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
          {menuItems.map((t) => {
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
    <div className="min-h-screen text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <NavLink
            to="/"
            className="text-base font-semibold tracking-tight text-slate-100 transition-colors hover:text-indigo-300"
          >
            Palmon Tools
          </NavLink>
          <nav className="flex items-center gap-1">
            {navItems.map((item) =>
              item.type === 'profile' ? (
                <ProfileMenu key="profile" />
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

      <footer className="mt-6 border-t border-slate-800/80 bg-slate-900/40">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <nav
            aria-label="Footer"
            className="grid grid-cols-3 gap-x-4 gap-y-4"
          >
            {footerColumns.map((col, i) => (
              <div
                key={col.header.label + i}
                className="flex flex-col items-center gap-1 text-center"
              >
                {col.header.to ? (
                  <NavLink
                    to={col.header.to}
                    end={col.header.end}
                    className={({ isActive }) =>
                      [
                        'text-xs font-semibold uppercase tracking-wide transition-colors',
                        isActive
                          ? 'text-indigo-300'
                          : 'text-slate-300 hover:text-white',
                      ].join(' ')
                    }
                  >
                    {col.header.label}
                  </NavLink>
                ) : (
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                    {col.header.label}
                  </span>
                )}
                {col.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
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
            ))}
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
                  ` build ${import.meta.env.VITE_APP_BUILD}`}
              </p>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
