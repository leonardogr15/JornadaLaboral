import AppLayout from '../components/AppLayout';
import ControlPanel from '../components/ControlPanel';

export default function PanelPage() {
  return (
    <AppLayout title="Mis jornadas">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mis jornadas</h1>
          <p className="page-subtitle">Registra la entrada y la salida de hoy y consulta tu historial.</p>
        </div>
      </div>
      <ControlPanel />
    </AppLayout>
  );
}
