import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import api from './api';

// The API module is replaced so the tests never reach the network.
vi.mock('./api', () => ({
  __esModule: true,
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

/** Builds an unsigned JWT-shaped token; the UI only decodes the payload. */
function fakeToken(payload) {
  const encode = (obj) => window.btoa(JSON.stringify(obj));
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`;
}

function renderAt(path) {
  window.history.pushState({}, '', path);
  return render(<App />);
}

beforeEach(() => {
  localStorage.clear();
  api.get.mockResolvedValue({ data: [] });
});

describe('protected routes', () => {
  test('redirects to the login page when there is no token', async () => {
    renderAt('/dashboard');

    expect(await screen.findByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
    expect(api.get).not.toHaveBeenCalled();
  });

  test('shows the work-shift panel for a logged-in user', async () => {
    localStorage.setItem('token', fakeToken({ id: 2, rol: 'user' }));
    renderAt('/dashboard');

    expect(await screen.findByRole('heading', { name: /registrar jornada/i })).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith('/jornadas');
  });

  test('shows the settings button only to admins', async () => {
    localStorage.setItem('token', fakeToken({ id: 2, rol: 'user' }));
    const { unmount } = renderAt('/dashboard');
    await screen.findByRole('heading', { name: /registrar jornada/i });
    expect(screen.queryByRole('button', { name: /configuración/i })).not.toBeInTheDocument();
    unmount();

    localStorage.setItem('token', fakeToken({ id: 1, rol: 'admin' }));
    renderAt('/dashboard');
    expect(await screen.findByRole('button', { name: /configuración/i })).toBeInTheDocument();
  });
});
