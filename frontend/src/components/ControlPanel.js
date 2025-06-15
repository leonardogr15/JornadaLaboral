import { useEffect, useState } from 'react';
import JornadaForm from '../components/JornadaForm';
import JornadaList from '../components/JornadaList';
import api from '../api';

export default function ControlPanel() {
  const [jornadas, setJornadas] = useState([]);

  useEffect(() => {
    const fetchJornadas = async () => {
      try {
        const res = await api.get('/jornadas');
        setJornadas(res.data);
      } catch (err) {
        console.error('Error al obtener jornadas:', err);
      }
  };

    fetchJornadas();
  }, []);


  const handleNuevaJornada = async ({ horaEntrada, horaSalida }) => {
    try {

      const { data: nuevaJornada } = await api.post('/jornadas', {
        horaEntrada,
        horaSalida,
      });
      setJornadas((prev) => [...prev, nuevaJornada]);
    } catch (err) {
      console.error('Error al registrar nueva jornada:', err);
    }
  };

  return (
    <div className="form-panel" style={{ padding: '2rem' }}>
      <JornadaForm onAdd={handleNuevaJornada} />
      <hr />
      <JornadaList jornadas={jornadas} />
    </div>
  );
}
