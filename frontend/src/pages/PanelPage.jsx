import ControlPanel from '../components/ControlPanel';
import { useNavigate } from 'react-router-dom';
import { FiSettings,FiLogOut } from 'react-icons/fi';
import '../styles/ControlPanelStyle.css' 


export default function PanelPage() {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  let userRole = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userRole = payload.rol;
    } catch (err) {
      console.error('Token inválido:', err);
    }
  }

  const irAConfiguracion = () => {
    navigate('/configuracion');
  };
  const cerrarSesion = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div style={{ padding: '2rem', width:'40%' }}>
      <div className="panel-header">

        <button className="logout-btn" onClick={cerrarSesion}>
          Cerrar sesión <FiLogOut className="icon" />
        </button>
        
        {userRole === 'admin' && (
          <button className="config-btn" onClick={irAConfiguracion}>
            Configuración <FiSettings className="icon" />
          </button>
        )}
        
      </div>
      <ControlPanel />
    </div>
  );
}