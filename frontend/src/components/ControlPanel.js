import { useEffect, useState } from 'react';
import JornadaForm from '../components/JornadaForm';
import JornadaList from '../components/JornadaList';
import api from '../api';
import '../styles/ControlPanelStyle.css'

export default function ControlPanel() {
  const [jornadas, setJornadas] = useState([]);

  
  

  return (
    <div className="form-panel" style={{ padding: '2rem' }}>
      <JornadaForm/>
      <hr />
      <JornadaList jornadas={jornadas} />
    </div>
  );
}
