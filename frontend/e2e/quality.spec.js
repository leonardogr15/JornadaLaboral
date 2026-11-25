import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, ADMIN_PASSWORD, API_URL, apiToken, createNormalUser, login, watchForProblems } from './helpers';

/**
 * Accessibility (axe, WCAG 2.1 A/AA including colour contrast) and layout checks for every screen
 * at the four reference sizes. Viewports are set explicitly, so this runs in the desktop project
 * only.
 */
const SIZES = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

// Playwright needs an object pattern for the fixtures argument, even when none is used.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  testInfo.skip(testInfo.project.name !== 'desktop', 'viewports are set by the test');
});

async function expectAccessible(page, screen) {
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const summary = violations.map((v) => `${screen}: ${v.id} (${v.nodes.length}) ${v.help}`);
  expect(summary).toEqual([]);
}

/** No sideways scrolling, and every control is visible, inside the screen and big enough to press. */
async function expectUsableLayout(page, screen) {
  const report = await page.evaluate(() => {
    const doc = document.documentElement;
    const problems = [];
    if (doc.scrollWidth > doc.clientWidth + 1) problems.push(`page is ${doc.scrollWidth}px wide for ${doc.clientWidth}px`);
    for (const el of document.querySelectorAll('button, a[href], input, select')) {
      const style = getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none') continue;
      const r = el.getBoundingClientRect();
      const name = el.getAttribute('aria-label') || el.textContent.trim() || el.id || el.tagName;
      if (el.classList.contains('skip-link')) continue; // intentionally off-screen until focused
      if (r.width < 24 || r.height < 24) problems.push(`${name}: ${Math.round(r.width)}x${Math.round(r.height)}`);
      if (r.left < -1 || r.right > doc.clientWidth + 1) problems.push(`${name}: outside the screen (${Math.round(r.left)}..${Math.round(r.right)})`);
      if (el.scrollWidth > el.clientWidth + 1 && el.tagName === 'BUTTON') problems.push(`${name}: text cut off`);
    }
    return problems;
  });
  expect(report, `${screen} layout`).toEqual([]);
}

test.beforeAll(() => {
  if (ADMIN_PASSWORD.length < 12) throw new Error('Set DEMO_ADMIN_PASSWORD to the value in the root .env.');
});

for (const size of SIZES) {
  test(`screens are accessible and usable at ${size.width}x${size.height}`, async ({ browser, request }) => {
    const user = await createNormalUser(request, `layout${size.width}`);
    const token = await apiToken(request, user.email, user.password);
    await request.post(`${API_URL}/jornadas`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { fecha: '2026-11-20', horaEntrada: '08:00', horaSalida: '16:30' },
    });

    const context = await browser.newContext({ viewport: size });
    const page = await context.newPage();
    const problems = await watchForProblems(page);

    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expectAccessible(page, 'sign-in');
    await expectUsableLayout(page, 'sign-in');

    // Validation messages are part of the sign-in screen too.
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page.getByText('Introduce tu correo electrónico.')).toBeVisible();
    await expectAccessible(page, 'sign-in with errors');

    await login(page, user.email, user.password);
    await expect(page.locator('.jornada-table tbody tr')).toHaveCount(1);
    await expectAccessible(page, 'shifts');
    await expectUsableLayout(page, 'shifts');
    await page.getByRole('button', { name: /Cerrar sesión/ }).click();

    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.getByRole('link', { name: 'Usuarios' }).click();
    await expect(page.getByRole('button', { name: `Editar a ${'Lucía Ramos'}` }).first()).toBeVisible();
    await expectAccessible(page, 'users');
    await expectUsableLayout(page, 'users');
    await page.getByRole('button', { name: 'Nuevo usuario' }).click();
    await expectAccessible(page, 'users with form');
    await expectUsableLayout(page, 'users with form');

    expect(problems).toEqual([]);
    await context.close();
  });
}

test('the main flow works with the keyboard alone', async ({ page, request }) => {
  const user = await createNormalUser(request, 'keyboard');
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Correo electrónico', { exact: true })).toBeFocused();
  await page.keyboard.type(user.email);
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Contraseña', { exact: true })).toBeFocused();
  await page.keyboard.type(user.password);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/dashboard$/);

  // Skip link first, then the header; the form is reachable and submits with Enter.
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
  // The native time field follows the OS locale: 24-hour, or 12-hour with an AM/PM segment.
  const entrada = page.getByLabel('Hora de entrada');
  await entrada.focus();
  await page.keyboard.type('0800');
  const docesHoras = (await entrada.inputValue()) === '';
  if (docesHoras) await page.keyboard.type('A');
  // The native time field has its own stops (segments, picker); Tab moves on within a few presses.
  for (let i = 0; i < 3 && !(await page.getByLabel('Hora de salida').evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press('Tab');
  }
  await expect(page.getByLabel('Hora de salida')).toBeFocused();
  await page.keyboard.type(docesHoras ? '0400P' : '1600');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status').filter({ hasText: 'Jornada registrada: 8 h.' })).toBeVisible();
});
