import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import PageTracker from './components/PageTracker.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Profile from './pages/Profile.jsx';
import Speedups from './pages/Speedups.jsx';
import Resources from './pages/Resources.jsx';
import Buildings from './pages/Buildings.jsx';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <PageTracker />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="speedups" element={<Speedups />} />
          <Route path="resources" element={<Resources />} />
          <Route path="buildings" element={<Buildings />} />
          <Route path="profile" element={<Profile />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
