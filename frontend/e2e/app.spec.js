import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, ADMIN_PASSWORD, API_URL, apiToken, createNormalUser, login, watchForProblems } from './helpers';

test.beforeAll(() => {
  if (ADMIN_PASSWORD.length < 12) throw new Error('Set DEMO_ADMIN_PASSWORD to the value in the root .env.');
});

test('the page is served with the strict Content-Security-Policy', async ({ request }) => {
  for (const path of ['/', '/dashboard', '/configuracion']) {
    const res = await request.get(path);
    const csp = res.headers()['content-security-policy'] ?? '';
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("style-src 'self'");
    expect(csp).not.toMatch(/unsafe-inline|unsafe-eval|\*/);
  }
});

test('an admin signs in, records a shift once and manages users, with no CSP errors', async ({ page }) => {
  const problems = await watchForProblems(page);
  const listed = page.waitForResponse((r) => r.url().endsWith('/api/jornadas') && r.request().method() === 'GET');
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  await listed; // count the history only once it has loaded

  const rowsBefore = await page.locator('.jornada-table tbody tr').count();
  await page.getByLabel('Hora de entrada').fill('08:00');
  await page.getByLabel('Hora de salida').fill('16:30');
  const saved = page.waitForResponse((r) => r.url().endsWith('/api/jornadas') && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Guardar jornada' }).click();
  expect((await saved).status()).toBe(201);
  await expect(page.getByRole('status').filter({ hasText: 'Jornada registrada: 8 h 30 min.' })).toBeVisible();
  await expect(page.locator('.jornada-table tbody tr')).toHaveCount(rowsBefore + 1);

  await page.getByRole('link', { name: 'Usuarios' }).click();
  await expect(page).toHaveURL(/\/configuracion$/);
  const email = `marta.${Date.now()}@example.com`;
  await page.getByRole('button', { name: 'Nuevo usuario' }).click();
  await page.getByLabel('Nombre').fill('Marta Díaz');
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña').fill(`pw-${crypto.randomUUID()}`);
  await page.getByRole('button', { name: 'Crear usuario' }).click();
  await expect(page.getByText('Usuario «Marta Díaz» creado.')).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();

  await page.getByRole('link', { name: 'Mis jornadas' }).click();
  await page.getByRole('button', { name: /Cerrar sesión/ }).click();
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  expect(problems).toEqual([]);
});

test('a normal user cannot reach user management, even by tampering with the frontend', async ({ page, request }) => {
  const problems = await watchForProblems(page);
  const user = await createNormalUser(request, 'lucia');
  await login(page, user.email, user.password);
  await expect(page.getByRole('heading', { name: 'Registrar jornada' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Usuarios' })).toHaveCount(0);

  // 1. Opening the admin page directly: the API refuses (403) and no user list is shown.
  const refused = page.waitForResponse((r) => r.url().endsWith('/api/usuarios') && r.request().method() === 'GET');
  await page.goto('/configuracion');
  expect((await refused).status()).toBe(403);
  await expect(page.getByRole('alert')).toHaveText('No tienes permisos para gestionar usuarios.');
  await expect(page.locator('tbody tr')).toHaveCount(0);

  // 2. Rewriting the token payload to claim "admin" breaks its signature: the API rejects it (401).
  await page.evaluate(() => {
    const [h, p, s] = localStorage.getItem('token').split('.');
    const claims = JSON.parse(atob(p));
    localStorage.setItem('token', [h, btoa(JSON.stringify({ ...claims, rol: 'admin' })).replace(/=+$/, ''), s].join('.'));
  });
  const forged = page.waitForResponse((r) => r.url().endsWith('/api/usuarios') && r.request().method() === 'GET');
  await page.reload();
  expect((await forged).status()).toBe(401);
  await expect(page.locator('tbody tr')).toHaveCount(0);

  // The frontend console shows the refused API calls; nothing else (and no CSP violation).
  expect(problems.filter((p) => !/status of 40[13]/.test(p))).toEqual([]);

  // 3. With a valid token, the API refuses every user-management call, including self-promotion.
  const token = await apiToken(request, user.email, user.password);
  const auth = { Authorization: `Bearer ${token}` };
  expect((await request.put(`${API_URL}/usuarios/${user.id}`, { headers: auth, data: { rol: 'admin' } })).status()).toBe(403);
  expect((await request.post(`${API_URL}/usuarios`, { headers: auth, data: { nombre: 'X', email: `x${Date.now()}@example.com`, password: 'long-enough-1', rol: 'admin' } })).status()).toBe(403);
  const me = await request.get(`${API_URL}/usuarios/me`, { headers: auth });
  expect((await me.json()).rol).toBe('user');
});
