import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import PanelPage from './pages/PanelPage';
import SettingsPage from './pages/SettingsPage';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
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
