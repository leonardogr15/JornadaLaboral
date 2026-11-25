import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, ADMIN_PASSWORD, login } from '../helpers';
import { EMPLOYEE, seedDemo } from './seed';

/**
 * README media (DOCS=1 npm run e2e, on a freshly started Compose stack): three screenshots and the
 * frames that scripts/make_demo_media.sh turns into a GIF. Synthetic data only; the login form is
 * never captured with a visible password (the field is masked).
 */
const OUT = '../docs/images';
const RAW = 'docs-output';

test('README screenshots and animation frames', async ({ browser, request }) => {
  test.setTimeout(120_000);
  mkdirSync(OUT, { recursive: true });
  rmSync(RAW, { recursive: true, force: true });
  mkdirSync(RAW, { recursive: true });
  const { password } = await seedDemo(request);
  const desktop = { viewport: { width: 1280, height: 900 } };
  // JPEG: the photographic background makes PNG captures about 1 MB each.
  const shot = (page, name) => page.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 82 });

  // 1. Sign-in page (empty form).
  const anon = await (await browser.newContext(desktop)).newPage();
  await anon.goto('/');
  await anon.evaluate(() => document.fonts.ready);
  await shot(anon, 'login');

  // 2. The employee's shift history.
  const lucia = await (await browser.newContext(desktop)).newPage();
  await login(lucia, EMPLOYEE.email, password);
  await expect(lucia.locator('.jornada-table tbody tr')).toHaveCount(5);
  await lucia.evaluate(() => document.fonts.ready);
  await shot(lucia, 'shifts');

  // 3. User management (admin).
  const admin = await (await browser.newContext(desktop)).newPage();
  await login(admin, ADMIN_EMAIL, ADMIN_PASSWORD);
  await admin.getByRole('button', { name: /Configuración/ }).click();
  await expect(admin.getByRole('cell', { name: EMPLOYEE.email })).toBeVisible();
  await admin.evaluate(() => document.fonts.ready);
  await shot(admin, 'users');

  // 4. Animation frames: Lucía signs in and records today's shift. Each step is a real screenshot
  // (no video compression noise), assembled by scripts/make_demo_media.sh with these durations.
  // 1000x1000 keeps the desktop layout, the form and the whole history in one legible frame.
  const lines = ['ffconcat version 1.0'];
  let count = 0;
  const page = await (await browser.newContext({ viewport: { width: 1000, height: 1000 } })).newPage();
  const frame = async (seconds) => {
    const file = `frame-${String(count++).padStart(2, '0')}.png`;
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${RAW}/${file}` });
    lines.push(`file '${file}'`, `duration ${seconds}`);
  };

  await page.goto('/');
  await frame(1.2);
  await page.getByPlaceholder('Correo electrónico').fill(EMPLOYEE.email);
  await page.getByPlaceholder('Contraseña').fill(password); // masked field
  await frame(1.4);
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.locator('.jornada-table tbody tr')).toHaveCount(5);
  await frame(2.0);
  await page.getByLabel('Hora de entrada').fill('08:30');
  await frame(1.0);
  await page.getByLabel('Hora de salida').fill('17:15');
  await frame(1.4);
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByText('Hora registrada exitosamente')).toBeVisible();
  await expect(page.locator('.jornada-table tbody tr')).toHaveCount(6);
  await frame(3.5);
  // The concat demuxer only honours the last duration if the last file is listed again.
  lines.push(`file 'frame-${String(count - 1).padStart(2, '0')}.png'`);
  writeFileSync(`${RAW}/frames.txt`, `${lines.join('\n')}\n`);
});
