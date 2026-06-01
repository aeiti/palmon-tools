import { Suspense } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import { LEGACY_REDIRECTS, ROUTES } from './routes.js';
import { TOOLS } from './tools.js';

function RouteSuspenseFallback() {
  return (
    <div className="px-4 py-8 text-center text-sm text-slate-400">
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<Layout />}>
          {TOOLS.map(({ key, path, index, page: Page }) => {
            const element = (
              <Suspense fallback={<RouteSuspenseFallback />}>
                <Page />
              </Suspense>
            );
            return index ? (
              <Route key={key} index element={element} />
            ) : (
              <Route key={key} path={path} element={element} />
            );
          })}
          {LEGACY_REDIRECTS.map(({ from, to }) => (
            <Route
              key={from}
              path={from}
              element={<Navigate to={to} replace />}
            />
          ))}
          <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
