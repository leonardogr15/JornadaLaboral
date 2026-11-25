import { useEffect, useState } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import JornadaForm from './JornadaForm';
import JornadaList from './JornadaList';
import ShiftSummary from './ShiftSummary';
import api from '../api';

export default function ControlPanel() {
  const [jornadas, setJornadas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJornadas = async () => {
      try {
        const res = await api.get('/jornadas');
        setJornadas(res.data);
      } catch {
        setError('No se pudo cargar el historial. Vuelve a intentarlo en unos minutos.');
      } finally {
        setCargando(false);
      }
    };
    fetchJornadas();
  }, []);

  // JornadaForm already saved the shift; only the list is updated here.
  const handleNuevaJornada = (nuevaJornada) => {
    setJornadas((prev) => [...prev, nuevaJornada]);
  };

  return (
    <div className="shifts-layout">
      <JornadaForm onAdd={handleNuevaJornada} />
      <div className="shifts-main">
        <ShiftSummary jornadas={jornadas} />
        {error && (
          <div className="alert alert-error" role="alert">
            <FiAlertCircle aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
        <JornadaList jornadas={jornadas} cargando={cargando} />
      </div>
    </div>
  );
}
