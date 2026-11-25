import { FiClock } from 'react-icons/fi';
import { formatDuration, formatShiftDate } from '../utils/format';

export default function JornadaList({ jornadas, cargando = false }) {
  // Newest first; the API returns them oldest first.
  const filas = [...jornadas].reverse();

  return (
    <section className="card history" aria-labelledby="historial-titulo">
      <div className="card-header">
        <div>
          <h2 id="historial-titulo" className="card-title">Historial de jornadas</h2>
          <p className="card-subtitle">Las más recientes primero.</p>
        </div>
      </div>
      <div className="card-body">
        {filas.length === 0 ? (
          <div className="empty-state">
            <FiClock aria-hidden="true" />
            <p className="empty-state-title">{cargando ? 'Cargando historial…' : 'Aún no hay jornadas'}</p>
            {!cargando && <p>Registra la primera con el formulario.</p>}
          </div>
        ) : (
          <table role="table" className="table table-stack jornada-table shift-table">
            <thead role="rowgroup">
              <tr role="row">
                <th role="columnheader" scope="col">Fecha</th>
                <th role="columnheader" scope="col">Entrada</th>
                <th role="columnheader" scope="col">Salida</th>
                <th role="columnheader" scope="col" className="col-end">Horas trabajadas</th>
              </tr>
            </thead>
            <tbody role="rowgroup">
              {filas.map((j, index) => {
                const { date, weekday } = formatShiftDate(j.fecha);
                return (
                  <tr role="row" key={j._id ?? index}>
                    <td role="cell" data-label="Fecha" className="shift-date">
                      <span>
                        <span className="cell-primary num">{date}</span>
                        <span className="cell-secondary">{weekday}</span>
                      </span>
                    </td>
                    <td role="cell" data-label="Entrada" className="num shift-in">{j.horaEntrada}</td>
                    <td role="cell" data-label="Salida" className="num shift-out">{j.horaSalida}</td>
                    <td role="cell" data-label="Horas trabajadas" className="col-end shift-hours">
                      <span className="duration-pill">{formatDuration(j.horasTrabajadas)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
