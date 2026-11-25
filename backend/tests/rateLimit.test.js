// A low limit for this file only; jest gives each test file its own module
// registry, so the limiter (created when routes load) starts empty here.
process.env.LOGIN_RATE_LIMIT_MAX = '3';

const { USER, createApp, connect, resetData, disconnect, seedUsers, request } = require('./helpers');

const app = createApp();

beforeAll(async () => {
  await connect();
  await resetData();
  await seedUsers();
});
afterAll(disconnect);

const attempt = (password) =>
  request(app).post('/api/auth/login').send({ email: USER.email, password });

it('does not count successful logins towards the limit', async () => {
  for (let i = 0; i < 4; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    expect((await attempt(USER.password)).status).toBe(200);
  }
});

it('returns 429 after too many failed attempts, even with the right password', async () => {
  for (let i = 0; i < 3; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    expect((await attempt('wrong-password')).status).toBe(401);
  }
  const blocked = await attempt('wrong-password');
  expect(blocked.status).toBe(429);
  expect(blocked.body.error).toMatch(/Demasiados intentos/);

  expect((await attempt(USER.password)).status).toBe(429);
});
