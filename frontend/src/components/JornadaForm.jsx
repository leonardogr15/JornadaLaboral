import { useState } from 'react';
import { FaClock } from 'react-icons/fa';
import api from '../api';
import '../styles/ControlPanelStyle.css';

/** Today's date in the user's time zone, as the API expects it (YYYY-MM-DD). */
function hoyLocal() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function JornadaForm({ onAdd }) {
    const [entrada, setEntrada] = useState('');
    const [salida, setSalida] = useState('');
    const [mensaje, setMensaje] = useState('');

    // Clearing the entry time also clears the exit time and any message.
    const handleEntradaChange = (value) => {
        setEntrada(value);
        if (!value) {
            setSalida('');
            setMensaje('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje('');

        if (salida <= entrada) {
            setMensaje('Error: La hora de salida debe ser posterior a la de entrada');
            return;
        }

        try {
            const res = await api.post('/jornadas', {
                horaEntrada: entrada,
                horaSalida: salida,
                // Sent explicitly so the shift is filed under the user's local day,
                // not the server's UTC day.
                fecha: hoyLocal(),
            });

            onAdd(res.data);
            setMensaje('Hora registrada exitosamente');
            setEntrada('');
            setSalida('');
        } catch {
            setMensaje('Error al registrar Horario');
        }
    };

    return (
        <form className="form-panel" onSubmit={handleSubmit}>
            <h3>Registrar Jornada</h3>
            {mensaje && (<p style={{ color: mensaje.includes('Error') ? 'red' : 'white' }}>{mensaje}</p>)}

            <div className="input-form">
                <div className="input-time">
                    <label htmlFor="entrada">Hora de entrada</label>
                    <input id="entrada" type="time" placeholder="Hora de entrada" value={entrada} onChange={(e) => handleEntradaChange(e.target.value)} required />
                    <FaClock className="icon" />
                </div>

                <div className="input-time">
                    <label htmlFor="salida">Hora de salida</label>
                    <input id="salida" type="time" placeholder="Hora de salida" value={salida} onChange={(e) => setSalida(e.target.value)} disabled={!entrada}   required />
                    <FaClock className="icon" />
                </div>
            </div>

            <button type="submit">Guardar</button>
        </form>
    );
}
