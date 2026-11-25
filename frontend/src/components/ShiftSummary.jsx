import { formatDuration } from '../utils/format';

/** Totals computed from the shifts already loaded; no extra API call. */
export default function ShiftSummary({ jornadas }) {
  const total = jornadas.reduce((sum, j) => sum + Number(j.horasTrabajadas || 0), 0);
  const promedio = jornadas.length ? total / jornadas.length : 0;

  return (
    <dl className="stats" aria-label="Resumen de jornadas">
      <div className="card stat">
        <dt>Jornadas registradas</dt>
        <dd>{jornadas.length}</dd>
      </div>
      <div className="card stat">
        <dt>Horas totales</dt>
        <dd>{formatDuration(total)}</dd>
      </div>
      <div className="card stat">
        <dt>Promedio por jornada</dt>
        <dd>{jornadas.length ? formatDuration(promedio) : '—'}</dd>
      </div>
    </dl>
  );
}
