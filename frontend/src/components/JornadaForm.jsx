import { useState } from 'react';
import { FiAlertCircle, FiCalendar, FiCheckCircle, FiSave } from 'react-icons/fi';
import api from '../api';
import { formatDuration, minutesBetween, todayLong } from '../utils/format';

/** Today's date in the user's time zone, as the API expects it (YYYY-MM-DD). */
function hoyLocal() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function JornadaForm({ onAdd }) {
    const [entrada, setEntrada] = useState('');
    const [salida, setSalida] = useState('');
    const [mensaje, setMensaje] = useState(null); // { tipo: 'ok' | 'error', texto }
    const [guardando, setGuardando] = useState(false);

    // Clearing the entry time also clears the exit time and any message.
    const handleEntradaChange = (value) => {
        setEntrada(value);
        if (!value) {
            setSalida('');
            setMensaje(null);
        }
    };

    // Preview only: the server calculates and stores the worked hours.
    const minutos = minutesBetween(entrada, salida);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje(null);

        if (salida <= entrada) {
            setMensaje({ tipo: 'error', texto: 'La hora de salida debe ser posterior a la de entrada.' });
            return;
        }

        setGuardando(true);
        try {
            const res = await api.post('/jornadas', {
                horaEntrada: entrada,
                horaSalida: salida,
                // Sent explicitly so the shift is filed under the user's local day,
                // not the server's UTC day.
                fecha: hoyLocal(),
            });

            onAdd(res.data);
            setMensaje({ tipo: 'ok', texto: `Jornada registrada: ${formatDuration(res.data.horasTrabajadas)}.` });
            setEntrada('');
            setSalida('');
        } catch {
            setMensaje({ tipo: 'error', texto: 'No se pudo registrar la jornada. Inténtalo de nuevo.' });
        } finally {
            setGuardando(false);
        }
    };

    return (
        <section className="card" aria-labelledby="registrar-titulo">
            <div className="card-header">
                <div>
                    <h2 id="registrar-titulo" className="card-title">Registrar jornada</h2>
                    <p className="card-subtitle">Introduce tus horas de entrada y salida.</p>
                </div>
            </div>
            <form className="card-body shift-form" onSubmit={handleSubmit}>
                <p className="shift-day">
                    <FiCalendar aria-hidden="true" />
                    <span>Hoy, {todayLong()}</span>
                </p>

                <div className="shift-times">
                    <div className="field">
                        <label className="field-label" htmlFor="entrada">Hora de entrada</label>
                        <input id="entrada" className="input input-time" type="time" value={entrada} onChange={(e) => handleEntradaChange(e.target.value)} required />
                    </div>
                    <div className="field">
                        <label className="field-label" htmlFor="salida">Hora de salida</label>
                        <input id="salida" className="input input-time" type="time" value={salida} onChange={(e) => setSalida(e.target.value)} disabled={!entrada} required aria-describedby="salida-ayuda" />
                        <span id="salida-ayuda" className="field-hint">{entrada ? 'Posterior a la entrada.' : 'Primero indica la entrada.'}</span>
                    </div>
                </div>

                <p className="shift-duration" aria-live="polite">
                    <span>Duración</span>
                    <strong>{minutos ? formatDuration(minutos / 60) : '—'}</strong>
                </p>

                {mensaje && (
                    <div className={`alert ${mensaje.tipo === 'ok' ? 'alert-success' : 'alert-error'}`} role={mensaje.tipo === 'ok' ? 'status' : 'alert'}>
                        {mensaje.tipo === 'ok' ? <FiCheckCircle aria-hidden="true" /> : <FiAlertCircle aria-hidden="true" />}
                        <span>{mensaje.texto}</span>
                    </div>
                )}

                <button type="submit" className="btn btn-primary btn-block" disabled={guardando}>
                    <FiSave aria-hidden="true" />
                    {guardando ? 'Guardando…' : 'Guardar jornada'}
                </button>
            </form>
        </section>
    );
}
