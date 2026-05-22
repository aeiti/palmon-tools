import { NavLink, Outlet } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/speedups', label: 'Speedups' },
  { to: '/profile', label: 'Profile' },
  { to: '/about', label: 'About' },
];

function linkClass({ isActive }) {
  return [
    'rounded px-3 py-1.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-indigo-600 text-white'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white',
  ].join(' ');
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
            {navLinks.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
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
