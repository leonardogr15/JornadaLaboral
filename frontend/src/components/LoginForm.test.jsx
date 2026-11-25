import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './LoginForm';
import api from '../api';

vi.mock('../api', () => ({
  __esModule: true,
  default: { post: vi.fn() },
}));

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/dashboard" element={<p>dashboard page</p>} />
      </Routes>
    </MemoryRouter>
  );
}

function fillAndSubmit(email, password) {
  fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));
}

beforeEach(() => {
  localStorage.clear();
  api.post.mockReset();
});

test('renders required email and password fields', () => {
  renderLogin();

  const email = screen.getByLabelText('Correo electrónico');
  const password = screen.getByLabelText('Contraseña');
  expect(email).toHaveAttribute('type', 'email');
  expect(email).toBeRequired();
  expect(password).toHaveAttribute('type', 'password');
  expect(password).toBeRequired();
});

test('stores the token and navigates to the dashboard on success', async () => {
  api.post.mockResolvedValue({ data: { token: 'header.payload.sig' } });
  renderLogin();

  fillAndSubmit('ana@example.com', 'secret-pass');

  expect(await screen.findByText('dashboard page')).toBeInTheDocument();
  expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'ana@example.com', password: 'secret-pass' });
  expect(localStorage.getItem('token')).toBe('header.payload.sig');
});

test('shows a generic error and stays on the login page on failure', async () => {
  api.post.mockRejectedValue(new Error('401'));
  renderLogin();

  fillAndSubmit('ana@example.com', 'wrong-pass');

  expect(await screen.findByText(/credenciales incorrectas/i)).toBeInTheDocument();
  await waitFor(() => expect(localStorage.getItem('token')).toBeNull());
  expect(screen.queryByText('dashboard page')).not.toBeInTheDocument();
});

test('explains empty fields without calling the API', async () => {
  renderLogin();

  fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

  expect(await screen.findByText('Introduce tu correo electrónico.')).toBeInTheDocument();
  expect(screen.getByText('Introduce tu contraseña.')).toBeInTheDocument();
  expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByLabelText('Correo electrónico')).toHaveFocus();
  expect(api.post).not.toHaveBeenCalled();
});
