import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './LoginForm';
import api from '../api';

jest.mock('../api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
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
  fireEvent.change(screen.getByPlaceholderText(/correo electrónico/i), { target: { value: email } });
  fireEvent.change(screen.getByPlaceholderText(/contraseña/i), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));
}

beforeEach(() => {
  localStorage.clear();
  api.post.mockReset();
});

test('renders required email and password fields', () => {
  renderLogin();

  const email = screen.getByPlaceholderText(/correo electrónico/i);
  const password = screen.getByPlaceholderText(/contraseña/i);
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
