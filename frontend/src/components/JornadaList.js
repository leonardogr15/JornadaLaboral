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
              <th>Horas Trabajadas</th>
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

              return (
                <tr key={index}>
                  <td>{fechaFormateada}</td>
                  <td>{j.horaEntrada}</td>
                  <td>{j.horaSalida}</td>
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
