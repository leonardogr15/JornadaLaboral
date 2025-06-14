import { useEffect, useState } from 'react';
import JornadaForm from '../components/JornadaForm';
import JornadaList from '../components/JornadaList';
import api from '../api';
import '../styles/ControlPanelStyle.css'

export default function ControlPanel() {
  const [jornadas, setJornadas] = useState([]);

  
  

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Panel de Control</h2>
      <JornadaForm />
      <hr />
      <JornadaList/>
    </div>
  );
}
