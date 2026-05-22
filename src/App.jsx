import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import PageTracker from './components/PageTracker.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Profile from './pages/Profile.jsx';
import Inventory from './pages/Inventory.jsx';
import Other from './pages/Other.jsx';
import Speedups from './pages/Speedups.jsx';
import Resources from './pages/Resources.jsx';
import Buildings from './pages/Buildings.jsx';
import Palmon from './pages/Palmon.jsx';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <PageTracker />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="inventory/other" element={<Other />} />
          <Route path="inventory/resources" element={<Resources />} />
          <Route path="inventory/speedups" element={<Speedups />} />
          <Route
            path="resources"
            element={<Navigate to="/inventory/resources" replace />}
          />
          <Route
            path="speedups"
            element={<Navigate to="/inventory/speedups" replace />}
          />
          <Route path="buildings" element={<Buildings />} />
          <Route path="palmon" element={<Palmon />} />
          <Route path="profile" element={<Profile />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
