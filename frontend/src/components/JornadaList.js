

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
            {jornadas.map((j, index) => (
              <tr key={index}>
                <td>{j.fecha}</td>
                <td>{j.horaEntrada}</td>
                <td>{j.horaSalida}</td>
                <td>{j.horasTrabajadas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
