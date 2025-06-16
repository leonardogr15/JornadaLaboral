import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import LoginPage from './pages/LoginPage';
import PanelPage from './pages/PanelPage';
import SettingsPage from './pages/SettingsPage';

function useAutoLogout(inactivityMs = 1 * 60 * 1000) {
  const navigate = useNavigate();
  const timerId = useRef(null);

  const doLogout = () => {
    clearTimeout(timerId.current);
    localStorage.removeItem('token');
    navigate('/', { replace: true });
  };

  const resetTimer = () => {
    clearTimeout(timerId.current);
    timerId.current = setTimeout(doLogout, inactivityMs);
  };

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(ev => window.addEventListener(ev, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(timerId.current);
      events.forEach(ev => window.removeEventListener(ev, resetTimer));
    };
  }, []);
}

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  useAutoLogout(1 * 60 * 1000);
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<PrivateRoute><PanelPage /></PrivateRoute>} />
        <Route path="/configuracion" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
