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
        console.error('Error al obtener jornadas');
      }
    };

    fetchJornadas();
  }, []);
  
  const handleNuevaJornada = (jornada) => {
    const [h1, m1] = jornada.horaEntrada.split(':').map(Number);
    const [h2, m2] = jornada.horaSalida.split(':').map(Number);
    const horas = ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
    console.log(horas);
    
    setJornadas((prev) => [
      ...prev,
      {
        ...jornada,
        fecha: jornada.fecha || new Date().toISOString().split('T')[0],
        horasTrabajadas: horas.toFixed(2),
      },
    ]);
  };

  return (
    <div className="form-panel" style={{ padding: '2rem' }}>
      <JornadaForm onAdd={handleNuevaJornada} />
      <hr />
      <JornadaList jornadas={jornadas} />
    </div>
  );
}
