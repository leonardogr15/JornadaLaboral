const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/security');
const { ADMIN, USER, createApp, connect, resetData, disconnect, seedUsers, loginAs, request } = require('./helpers');

const app = createApp();

beforeAll(connect);
beforeEach(async () => {
  await resetData();
  await seedUsers();
});
afterAll(disconnect);

describe('POST /api/auth/login', () => {
  it('returns an HS256 token with the user id and role on valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: USER.email, password: USER.password });

    expect(res.status).toBe(200);
    const decoded = jwt.decode(res.body.token, { complete: true });
    expect(decoded.header.alg).toBe('HS256');
    expect(decoded.payload).toMatchObject({ rol: 'user' });
    expect(Number.isInteger(decoded.payload.id)).toBe(true);
  });

  it('accepts the email case-insensitively', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: USER.email.toUpperCase(), password: USER.password });
    expect(res.status).toBe(200);
  });

  it('returns the same generic 401 for a wrong password and for an unknown email', async () => {
    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: USER.email, password: 'not-the-password' });
    const unknownEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.local', password: 'whatever-pass' });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body).toEqual(unknownEmail.body);
    expect(wrongPassword.body).toEqual({ error: 'Credenciales inválidas' });
  });

  it('rejects a missing password with 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: USER.email });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Datos inválidos');
  });

  it('rejects malformed JSON with 400 and no stack trace', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email":');
    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).not.toMatch(/at .*\.js/);
  });
});

describe('token verification', () => {
  it('rejects requests without a token (401)', async () => {
    const res = await request(app).get('/api/jornadas');
    expect(res.status).toBe(401);
  });

  it('rejects an unsigned "alg: none" token claiming admin (401)', async () => {
    const forged = jwt.sign({ id: 1, rol: 'admin' }, null, { algorithm: 'none' });
    const res = await request(app).get('/api/usuarios').set('Authorization', `Bearer ${forged}`);
    expect(res.status).toBe(401);
  });

  it('rejects a token signed with another secret (401)', async () => {
    const forged = jwt.sign({ id: 1, rol: 'admin' }, 'x'.repeat(40), { algorithm: 'HS256' });
    const res = await request(app).get('/api/usuarios').set('Authorization', `Bearer ${forged}`);
    expect(res.status).toBe(401);
  });

  it('accepts a real admin token', async () => {
    const token = await loginAs(app, ADMIN);
    const res = await request(app).get('/api/usuarios').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});

describe('JWT_SECRET startup check', () => {
  const original = process.env.JWT_SECRET;
  afterEach(() => {
    process.env.JWT_SECRET = original;
  });

  it('throws when the secret is missing or shorter than 32 characters', () => {
    delete process.env.JWT_SECRET;
    expect(() => getJwtSecret()).toThrow(/at least 32/);
    process.env.JWT_SECRET = 'short';
    expect(() => getJwtSecret()).toThrow(/at least 32/);
  });
});

describe('GET /api/health', () => {
  it('reports both datastores as up', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', postgres: 'up', mongo: 'up' });
  });

  it('sets security headers from helmet', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

describe('CORS allowlist', () => {
  it('allows a configured origin and omits the header for others', async () => {
    const allowed = await request(app).get('/api/health').set('Origin', 'http://localhost:3000');
    const denied = await request(app).get('/api/health').set('Origin', 'https://evil.example');
    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
  });
});
