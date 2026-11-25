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

test('lists users and edits one, then closes the form with a confirmation', async () => {
  api.get.mockResolvedValue({ data: [ANA] });
  api.put.mockResolvedValue({ data: { ...ANA, nombre: 'Ana P. Gómez' } });
  const user = userEvent.setup();
  renderPage();

  await user.click(await screen.findByRole('button', { name: 'Editar a Ana Pérez' }));
  expect(screen.getByRole('heading', { name: /editar usuario/i })).toBeInTheDocument();
  const nombre = screen.getByLabelText('Nombre');
  expect(nombre).toHaveValue('Ana Pérez');

  await user.clear(nombre);
  await user.type(nombre, 'Ana P. Gómez');
  await user.click(screen.getByRole('button', { name: /guardar cambios/i }));

  expect(api.put).toHaveBeenCalledWith('/usuarios/2', expect.objectContaining({ nombre: 'Ana P. Gómez', password: '' }));
  expect(await screen.findByText('Usuario «Ana P. Gómez» actualizado.')).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: /editar usuario/i })).not.toBeInTheDocument();
});

test('shows roles in Spanish while keeping the internal values', async () => {
  api.get.mockResolvedValue({ data: [ANA, { id: 1, nombre: 'Admin Demo', email: 'admin@example.com', rol: 'admin' }] });
  const user = userEvent.setup();
  renderPage();

  const filaAna = (await screen.findByText('Ana Pérez')).closest('tr');
  expect(within(filaAna).getByText('Usuario')).toBeInTheDocument();
  const filaAdmin = screen.getByText('Admin Demo').closest('tr');
  expect(within(filaAdmin).getByText('Administrador')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Editar a Admin Demo' }));
  expect(screen.getByLabelText('Rol')).toHaveValue('admin');
});

test('shows the reason when the API refuses to create a user', async () => {
  api.get.mockResolvedValue({ data: [] });
  api.post.mockRejectedValue({ response: { status: 409, data: { error: 'El email ya está registrado' } } });
  const user = userEvent.setup();
  renderPage();

  await user.click(await screen.findByRole('button', { name: /nuevo usuario/i }));
  await user.type(screen.getByLabelText('Nombre'), 'Ana Pérez');
  await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
  await user.type(screen.getByLabelText('Contraseña'), 'long-enough-1');
  await user.click(screen.getByRole('button', { name: /crear usuario/i }));

  expect(await screen.findByRole('alert')).toHaveTextContent('El email ya está registrado');
  expect(screen.getByRole('heading', { name: /crear usuario/i })).toBeInTheDocument(); // form stays open
});

test('deletes a user after confirmation', async () => {
  api.get.mockResolvedValue({ data: [ANA] });
  api.delete.mockResolvedValue({});
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  const user = userEvent.setup();
  renderPage();

  await user.click(await screen.findByRole('button', { name: 'Eliminar a Ana Pérez' }));

  expect(api.delete).toHaveBeenCalledWith('/usuarios/2');
  expect(await screen.findByText('Usuario «Ana Pérez» eliminado.')).toBeInTheDocument();
  expect(screen.queryByText('ana@example.com')).not.toBeInTheDocument();
});

test('reports a refusal from the API instead of showing an empty list', async () => {
  api.get.mockRejectedValue({ response: { status: 403 } });
  renderPage();

  expect(await screen.findByRole('alert')).toHaveTextContent(/no tienes permisos/i);
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /nuevo usuario/i })).not.toBeInTheDocument();
});

test('moves keyboard focus into the form when it opens', async () => {
  api.get.mockResolvedValue({ data: [ANA] });
  const user = userEvent.setup();
  renderPage();

  await user.click(await screen.findByRole('button', { name: /nuevo usuario/i }));
  expect(screen.getByLabelText('Nombre')).toHaveFocus();
});
