import { render, screen } from '@testing-library/react';
import JornadaList from './JornadaList';

const SHIFT = { fecha: '2026-11-16T00:00:00.000Z', horaEntrada: '08:00', horaSalida: '16:30', horasTrabajadas: 8.5 };

describe('shift dates', () => {
  const original = process.env.TZ;
  afterEach(() => { process.env.TZ = original; });

  test.each(['America/Bogota', 'UTC', 'Asia/Tokyo'])('show the stored calendar day in %s', (tz) => {
    process.env.TZ = tz; // Node applies a TZ change at runtime
    render(<JornadaList jornadas={[SHIFT]} />);
    expect(screen.getByText('16/11/2026')).toBeInTheDocument();
  });
});
