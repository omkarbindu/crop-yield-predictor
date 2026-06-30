import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Weather from './pages/Weather';
import YieldPredictor from './pages/YieldPredictor';
import DiseasePredictor from './pages/DiseasePredictor';
import Marketplace from './pages/Marketplace';
import MandiPrices from './pages/MandiPrices';
import Schemes from './pages/Schemes';
import Advisory from './pages/Advisory';
import Community from './pages/Community';
import Equipment from './pages/Equipment';
import Profile from './pages/Profile';
import Shetimitra from './pages/Shetimitra';
import Alerts from './pages/Alerts';
import FMS from './pages/FMS';
import ShetimitraWidget from './components/ShetimitraWidget';

function PrivateRoute({ children }) {
  const { farmer, loading } = useAuth();
  if (loading) return <div className="page-center">Loading...</div>;
  return farmer ? children : <Navigate to="/login" replace />;
}

function PublicOnly({ children }) {
  const { farmer, loading } = useAuth();
  if (loading) return <div className="page-center">Loading...</div>;
  return !farmer ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
          <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/weather" element={<PrivateRoute><Weather /></PrivateRoute>} />
          <Route path="/yield" element={<PrivateRoute><YieldPredictor /></PrivateRoute>} />
          <Route path="/disease" element={<PrivateRoute><DiseasePredictor /></PrivateRoute>} />
          <Route path="/marketplace" element={<PrivateRoute><Marketplace /></PrivateRoute>} />
          <Route path="/mandi" element={<PrivateRoute><MandiPrices /></PrivateRoute>} />
          <Route path="/schemes" element={<PrivateRoute><Schemes /></PrivateRoute>} />
          <Route path="/advisory" element={<PrivateRoute><Advisory /></PrivateRoute>} />
          <Route path="/community" element={<PrivateRoute><Community /></PrivateRoute>} />
          <Route path="/equipment" element={<PrivateRoute><Equipment /></PrivateRoute>} />
          <Route path="/shetimitra" element={<PrivateRoute><Shetimitra /></PrivateRoute>} />
          <Route path="/alerts" element={<PrivateRoute><Alerts /></PrivateRoute>} />
          <Route path="/fms" element={<PrivateRoute><FMS /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <ShetimitraWidget />
    </>
  );
}
