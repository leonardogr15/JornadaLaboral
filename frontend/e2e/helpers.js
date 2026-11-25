import { expect } from '@playwright/test';

export const ADMIN_EMAIL = process.env.DEMO_ADMIN_EMAIL ?? 'admin@example.com';
export const ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD ?? '';
export const API_URL = process.env.E2E_API_URL ?? 'http://localhost:5000/api';

/**
 * Fails the test on any Content-Security-Policy violation or console error. Violations are
 * collected in the page (securitypolicyviolation event) and from the console.
 */
export async function watchForProblems(page) {
  const problems = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') problems.push(`console: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => {
      console.error(`CSP violation: ${e.violatedDirective} ${e.blockedURI}`);
    });
  });
  return problems;
}

export async function login(page, email, password) {
  await page.goto('/');
  await page.getByLabel('Correo electrónico', { exact: true }).fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

export async function apiToken(request, email, password) {
  const res = await request.post(`${API_URL}/auth/login`, { data: { email, password } });
  expect(res.status()).toBe(200);
  return (await res.json()).token;
}

/** Creates a normal user through the API as the demo admin; returns its credentials. */
export async function createNormalUser(request, label) {
  const admin = await apiToken(request, ADMIN_EMAIL, ADMIN_PASSWORD);
  const email = `${label}.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.com`;
  const password = `pw-${crypto.randomUUID()}`; // synthetic, never printed
  const res = await request.post(`${API_URL}/usuarios`, {
    headers: { Authorization: `Bearer ${admin}` },
    data: { nombre: 'Lucía Ramos', email, password, rol: 'user' },
  });
  expect(res.status()).toBe(201);
  return { email, password, id: (await res.json()).id };
}
