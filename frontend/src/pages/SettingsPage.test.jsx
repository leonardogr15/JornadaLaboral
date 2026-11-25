import { vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SettingsPage from './SettingsPage';
import api from '../api';

vi.mock('../api', () => ({
  __esModule: true,
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const ANA = { id: 2, nombre: 'Ana Pérez', email: 'ana@example.com', rol: 'user' };

function renderPage() {
  return render(
    <MemoryRouter>
      <SettingsPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  for (const fn of Object.values(api)) fn.mockReset();
});

test('lists users and edits one, then returns to an empty create form', async () => {
  api.get.mockResolvedValue({ data: [ANA] });
  api.put.mockResolvedValue({ data: { ...ANA, nombre: 'Ana P. Gómez' } });
  const user = userEvent.setup();
  renderPage();

  const row = (await screen.findByText('Ana Pérez')).closest('tr');
  await user.click(within(row).getAllByRole('button')[0]); // edit
  expect(screen.getByRole('heading', { name: /editar usuario/i })).toBeInTheDocument();
  const nombre = screen.getByPlaceholderText('Nombre');
  expect(nombre).toHaveValue('Ana Pérez');

  await user.clear(nombre);
  await user.type(nombre, 'Ana P. Gómez');
  await user.click(screen.getByRole('button', { name: /actualizar/i }));

  expect(api.put).toHaveBeenCalledWith('/usuarios/2', expect.objectContaining({ nombre: 'Ana P. Gómez', password: '' }));
  expect(await screen.findByRole('heading', { name: /crear usuario/i })).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Nombre')).toHaveValue('');
});

test('reports a refusal from the API instead of showing an empty list', async () => {
  api.get.mockRejectedValue({ response: { status: 403 } });
  renderPage();

  expect(await screen.findByRole('alert')).toHaveTextContent(/no tienes permisos/i);
});
