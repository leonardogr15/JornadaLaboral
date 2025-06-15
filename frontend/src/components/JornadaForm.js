import { useState } from 'react';
import { FaClock } from 'react-icons/fa';
import api from '../api';
import '../styles/ControlPanelStyle.css';

export default function JornadaForm({ onAdd }) {
    const [entrada, setEntrada] = useState('');
    const [salida, setSalida] = useState('');
    const [mensaje, setMensaje] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await api.post('/jornadas', {
                horaEntrada: entrada,
                horaSalida: salida,
            });

            onAdd(res.data);
            setMensaje('Hora registrada exitosamente');
            setEntrada('');
            setSalida('');
        } catch (err) {
            setMensaje('Error al registrar Horario');
        }
    };

    return (
        <form className="form-panel" onSubmit={handleSubmit}>
            <h3>Registrar Jornada</h3>
            {mensaje && <p>{mensaje}</p>}

            <div className="input-form">
                <div className="input-time">
                    <label htmlFor="entrada">Hora de entrada</label>
                    <input type="time" placeholder="Hora de entrada" value={entrada} onChange={(e) => setEntrada(e.target.value)} required />
                    <FaClock className="icon" />
                </div>

                <div className="input-time">
                    <label htmlFor="salida">Hora de salida</label>
                    <input type="time" placeholder="Hora de salida" value={salida} onChange={(e) => setSalida(e.target.value)} required />
                    <FaClock className="icon" />
                </div>
            </div>

            <button type="submit">Guardar</button>
        </form>
    );
}
