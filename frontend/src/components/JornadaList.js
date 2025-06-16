export default function JornadaList({ jornadas }) {
  return (
    <div className="jornada-list">
      <h3>Historial de Jornadas</h3>
      <div className="table-container">
        <table className="jornada-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th>Horas</th>
            </tr>
          </thead>
          <tbody>
            {jornadas.map((j, index) => {
              const dateObj = new Date(j.fecha);
              const fechaFormateada = dateObj.toLocaleDateString('es-ES', {
                day:   '2-digit',
                month: '2-digit',
                year:  'numeric'
              });

              const fmtHora = (hora24) => {
                const [h, m] = hora24.split(':');
                const dt = new Date();
                dt.setHours(parseInt(h, 10), parseInt(m, 10), 0);
                return dt.toLocaleTimeString('es-ES', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                });
              };

              const entradaAMPM = fmtHora(j.horaEntrada);
              const salidaAMPM  = fmtHora(j.horaSalida);

              return (
                <tr key={index}>
                  <td>{fechaFormateada}</td>
                  <td>{entradaAMPM}</td>
                  <td>{salidaAMPM}</td>
                  <td>{j.horasTrabajadas}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
