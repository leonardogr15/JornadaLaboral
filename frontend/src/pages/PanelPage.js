import ControlPanel from '../components/ControlPanel';
import { useNavigate } from 'react-router-dom';
import { FiSettings,FiLogOut } from 'react-icons/fi';
import '../styles/ControlPanelStyle.css' 


export default function PanelPage() {
  const navigate = useNavigate();

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
        
        <button className="config-btn" onClick={irAConfiguracion}>
          Configuración <FiSettings className="icon" />
        </button>
        
      </div>
      <ControlPanel />
    </div>
  );
}