import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import PageTracker from './components/layout/PageTracker.jsx';
import { LEGACY_REDIRECTS, ROUTES } from './routes.js';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Profile from './pages/Profile.jsx';
import Inventory from './pages/Inventory.jsx';
import Other from './pages/Other.jsx';
import Speedups from './pages/Speedups.jsx';
import Resources from './pages/Resources.jsx';
import Buildings from './pages/Buildings.jsx';
import Palmon from './pages/Palmon.jsx';
import Squads from './pages/Squads.jsx';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <PageTracker />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path={ROUTES.inventory} element={<Inventory />} />
          <Route path={ROUTES.inventoryOther} element={<Other />} />
          <Route path={ROUTES.inventoryResources} element={<Resources />} />
          <Route path={ROUTES.inventorySpeedups} element={<Speedups />} />
          {LEGACY_REDIRECTS.map(({ from, to }) => (
            <Route
              key={from}
              path={from}
              element={<Navigate to={to} replace />}
            />
          ))}
          <Route path={ROUTES.buildings} element={<Buildings />} />
          <Route path={ROUTES.palmon} element={<Palmon />} />
          <Route path={ROUTES.squads} element={<Squads />} />
          <Route path={ROUTES.profile} element={<Profile />} />
          <Route path={ROUTES.about} element={<About />} />
          <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
