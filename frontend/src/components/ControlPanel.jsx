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


  // JornadaForm already saved the shift; only the list is updated here.
  const handleNuevaJornada = (nuevaJornada) => {
    setJornadas((prev) => [...prev, nuevaJornada]);
  };

  return (
    <div className="form-panel" style={{ padding: '2rem' }}>
      <JornadaForm onAdd={handleNuevaJornada} />
      <hr />
      <JornadaList jornadas={jornadas} />
    </div>
  );
}
