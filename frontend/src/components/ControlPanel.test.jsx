import { vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ControlPanel from './ControlPanel';
import api from '../api';

vi.mock('../api', () => ({
  __esModule: true,
  default: { get: vi.fn(), post: vi.fn() },
}));

beforeEach(() => {
  api.get.mockReset();
  api.post.mockReset();
  api.get.mockResolvedValue({ data: [] });
});

async function fillTimes(user, entrada, salida) {
  await user.type(screen.getByLabelText(/hora de entrada/i), entrada);
  await user.type(screen.getByLabelText(/hora de salida/i), salida);
}

test('registers a shift with a single API call and adds it to the history', async () => {
  api.post.mockResolvedValue({
    data: { _id: 'a1', fecha: '2026-11-20T00:00:00Z', horaEntrada: '08:00', horaSalida: '16:30', horasTrabajadas: 8.5 },
  });
  const user = userEvent.setup();
  render(<ControlPanel />);

  await fillTimes(user, '08:00', '16:30');
  await user.click(screen.getByRole('button', { name: /guardar/i }));

  expect(await screen.findByText(/hora registrada exitosamente/i)).toBeInTheDocument();
  expect(api.post).toHaveBeenCalledTimes(1);
  expect(api.post).toHaveBeenCalledWith('/jornadas', { horaEntrada: '08:00', horaSalida: '16:30' });
  const rows = within(screen.getByRole('table')).getAllByRole('row');
  expect(rows).toHaveLength(2); // header + the new shift
  expect(within(rows[1]).getByText('8.5')).toBeInTheDocument();
});

test('rejects an exit time that is not after the entry time without calling the API', async () => {
  const user = userEvent.setup();
  render(<ControlPanel />);

  await fillTimes(user, '10:00', '09:00');
  await user.click(screen.getByRole('button', { name: /guardar/i }));

  expect(await screen.findByText(/la hora de salida debe ser posterior/i)).toBeInTheDocument();
  expect(api.post).not.toHaveBeenCalled();
});

test('keeps the exit time disabled until an entry time is chosen', async () => {
  render(<ControlPanel />);
  expect(screen.getByLabelText(/hora de salida/i)).toBeDisabled();
});
