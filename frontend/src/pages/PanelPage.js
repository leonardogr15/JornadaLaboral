import ControlPanel from '../components/ControlPanel';
import { useNavigate } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi'; 


export default function PanelPage() {
  const navigate = useNavigate();

  const irAConfiguracion = () => {
    navigate('/configuracion');
  };
  return (
    <div style={{ padding: '2rem'}}>
      <div className="panel-header">
        <button className="config-btn" onClick={irAConfiguracion}>
          Configuración
          <FiSettings className="icon" />
        </button>
      </div>
      <ControlPanel />
    </div>
  );
}