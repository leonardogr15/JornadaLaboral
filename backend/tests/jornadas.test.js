const Jornada = require('../models/jornadaModel');
const { ADMIN, USER, createApp, connect, resetData, disconnect, seedUsers, loginAs, request } = require('./helpers');

const app = createApp();
let user;
let admin;
let userToken;
let adminToken;

const post = (token, body) =>
  request(app).post('/api/jornadas').set('Authorization', `Bearer ${token}`).send(body);
const list = (token) => request(app).get('/api/jornadas').set('Authorization', `Bearer ${token}`);

beforeAll(connect);
beforeEach(async () => {
  await resetData();
  ({ admin, user } = await seedUsers());
  userToken = await loginAs(app, USER);
  adminToken = await loginAs(app, ADMIN);
});
afterAll(disconnect);

describe('POST /api/jornadas', () => {
  it('registers a shift and computes the worked hours', async () => {
    const res = await post(userToken, { horaEntrada: '08:00', horaSalida: '16:30', fecha: '2026-03-02' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ horaEntrada: '08:00', horaSalida: '16:30', horasTrabajadas: 8.5, usuarioId: user.id });
    expect(res.body.fecha).toBe('2026-03-02T00:00:00.000Z');
  });

  it('rejects an exit time before the entry time (400)', async () => {
    const res = await post(userToken, { horaEntrada: '17:00', horaSalida: '09:00' });
    expect(res.status).toBe(400);
    expect(res.body.details[0]).toMatchObject({ path: 'horaSalida' });
    expect(await Jornada.countDocuments()).toBe(0);
  });

  it('rejects an exit time equal to the entry time (400)', async () => {
    expect((await post(userToken, { horaEntrada: '09:00', horaSalida: '09:00' })).status).toBe(400);
  });

  it.each([
    [{ horaEntrada: '25:00', horaSalida: '26:00' }],
    [{ horaEntrada: '9am', horaSalida: '5pm' }],
    [{ horaEntrada: '08:00' }],
    [{ horaEntrada: '08:00', horaSalida: '16:00', fecha: '2026-02-30' }],
    [{ horaEntrada: '08:00', horaSalida: '16:00', fecha: 'yesterday' }],
  ])('rejects invalid input %j (400)', async (body) => {
    expect((await post(userToken, body)).status).toBe(400);
  });

  it('ignores a usuarioId in the body and uses the authenticated user', async () => {
    const res = await post(userToken, { horaEntrada: '08:00', horaSalida: '12:00', usuarioId: admin.id });
    expect(res.status).toBe(201);
    expect(res.body.usuarioId).toBe(user.id);
  });

  it('requires authentication (401)', async () => {
    const res = await request(app).post('/api/jornadas').send({ horaEntrada: '08:00', horaSalida: '12:00' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/jornadas', () => {
  it('returns only the shifts of the authenticated user', async () => {
    await post(userToken, { horaEntrada: '08:00', horaSalida: '12:00' });
    await post(userToken, { horaEntrada: '13:00', horaSalida: '17:00' });
    await post(adminToken, { horaEntrada: '09:00', horaSalida: '18:00' });

    const mine = await list(userToken);
    expect(mine.status).toBe(200);
    expect(mine.body).toHaveLength(2);
    mine.body.forEach((j) => expect(j.usuarioId).toBe(user.id));

    const adminList = await list(adminToken);
    expect(adminList.body).toHaveLength(1);
    expect(adminList.body[0].usuarioId).toBe(admin.id);
  });

  it('requires authentication (401)', async () => {
    expect((await request(app).get('/api/jornadas')).status).toBe(401);
  });
});

describe('token of an account that no longer exists', () => {
  it('is rejected on shift routes as soon as the account is deleted (401)', async () => {
    const del = await request(app).delete(`/api/usuarios/${user.id}`).set('Authorization', `Bearer ${adminToken}`);
    expect(del.status).toBe(204);
    expect((await list(userToken)).status).toBe(401);
    expect((await post(userToken, { horaEntrada: '08:00', horaSalida: '09:00' })).status).toBe(401);
  });
});

describe('id parameters', () => {
  it('rejects ids outside the PostgreSQL integer range with 400, not 500', async () => {
    const res = await request(app).get('/api/usuarios/9999999999').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
  });
});
