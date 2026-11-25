import { expect } from '@playwright/test';
import { ADMIN_EMAIL, ADMIN_PASSWORD, API_URL, apiToken } from '../helpers';

/**
 * Synthetic demo data for the README media, created through the API on a freshly started stack:
 * three employees (one of them signs in on camera) and a week of shifts. All names are fictional
 * and every address uses the reserved example.com domain.
 */
export const EMPLOYEE = { nombre: 'Lucía Ramos', email: 'lucia.ramos@example.com' };
const COLLEAGUES = [
  { nombre: 'Marta Díaz', email: 'marta.diaz@example.com' },
  { nombre: 'Andrés Gómez', email: 'andres.gomez@example.com' },
];
const WEEK = [
  ['2026-11-16', '08:00', '16:30'],
  ['2026-11-17', '08:15', '17:00'],
  ['2026-11-18', '07:45', '16:00'],
  ['2026-11-19', '09:00', '18:15'],
  ['2026-11-20', '08:00', '14:00'],
];

export async function seedDemo(request) {
  if (ADMIN_PASSWORD.length < 12) throw new Error('Set DEMO_ADMIN_PASSWORD to the value in the root .env.');
  const admin = { Authorization: `Bearer ${await apiToken(request, ADMIN_EMAIL, ADMIN_PASSWORD)}` };
  const password = `pw-${crypto.randomUUID()}`; // synthetic, never printed or captured
  for (const person of [EMPLOYEE, ...COLLEAGUES]) {
    const res = await request.post(`${API_URL}/usuarios`, { headers: admin, data: { ...person, password, rol: 'user' } });
    if (res.status() === 409) throw new Error('Demo data already exists: run on a freshly started stack (see README).');
    expect(res.status()).toBe(201);
  }
  const employee = { Authorization: `Bearer ${await apiToken(request, EMPLOYEE.email, password)}` };
  for (const [fecha, horaEntrada, horaSalida] of WEEK) {
    const r = await request.post(`${API_URL}/jornadas`, { headers: employee, data: { fecha, horaEntrada, horaSalida } });
    expect(r.status()).toBe(201);
  }
  return { password };
}
