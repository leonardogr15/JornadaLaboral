const pool = require('../config/db_postgres');
const { ADMIN, USER, createApp, connect, resetData, disconnect, seedUsers, loginAs, request } = require('./helpers');

const app = createApp();
let admin;
let user;
let adminToken;
let userToken;

const asAdmin = (req) => req.set('Authorization', `Bearer ${adminToken}`);
const asUser = (req) => req.set('Authorization', `Bearer ${userToken}`);

beforeAll(connect);
beforeEach(async () => {
  await resetData();
  ({ admin, user } = await seedUsers());
  adminToken = await loginAs(app, ADMIN);
  userToken = await loginAs(app, USER);
});
afterAll(disconnect);

async function roleInDb(id) {
  const { rows } = await pool.query('SELECT rol FROM usuarios WHERE id = $1', [id]);
  return rows[0] && rows[0].rol;
}

describe('admin user management', () => {
  it('lists users without exposing password hashes', async () => {
    const res = await asAdmin(request(app).get('/api/usuarios'));
    expect(res.status).toBe(200);
    expect(res.body.map((u) => u.email)).toEqual([ADMIN.email, USER.email]);
    res.body.forEach((u) => expect(u).not.toHaveProperty('password'));
  });

  it('creates, reads, updates and deletes a user', async () => {
    const created = await asAdmin(request(app).post('/api/usuarios')).send({
      nombre: 'Luis',
      email: 'Luis@Test.local',
      password: 'luis-test-pass',
    });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ nombre: 'Luis', email: 'luis@test.local', rol: 'user' });
    const { id } = created.body;

    const read = await asAdmin(request(app).get(`/api/usuarios/${id}`));
    expect(read.status).toBe(200);

    // The edit form sends its id and an empty password; both are ignored.
    const updated = await asAdmin(request(app).put(`/api/usuarios/${id}`)).send({
      id,
      nombre: 'Luis M.',
      email: 'luis@test.local',
      password: '',
      rol: 'admin',
    });
    expect(updated.status).toBe(200);
    expect(updated.body).toMatchObject({ nombre: 'Luis M.', rol: 'admin' });
    await loginAs(app, { email: 'luis@test.local', password: 'luis-test-pass' });

    const removed = await asAdmin(request(app).delete(`/api/usuarios/${id}`));
    expect(removed.status).toBe(204);
    expect((await asAdmin(request(app).get(`/api/usuarios/${id}`))).status).toBe(404);
  });

  it('returns 409 for a duplicate email on create and on update', async () => {
    const dupCreate = await asAdmin(request(app).post('/api/usuarios')).send({
      nombre: 'Copy',
      email: USER.email,
      password: 'copy-test-pass',
    });
    expect(dupCreate.status).toBe(409);

    const dupUpdate = await asAdmin(request(app).put(`/api/usuarios/${user.id}`)).send({ email: ADMIN.email });
    expect(dupUpdate.status).toBe(409);
  });

  it('validates input (400) and reports unknown ids (404)', async () => {
    const badCreate = await asAdmin(request(app).post('/api/usuarios')).send({
      nombre: '',
      email: 'not-an-email',
      password: 'short',
      rol: 'superuser',
    });
    expect(badCreate.status).toBe(400);
    expect(badCreate.body.details.map((d) => d.path).sort()).toEqual(['email', 'nombre', 'password', 'rol']);

    expect((await asAdmin(request(app).get('/api/usuarios/abc'))).status).toBe(400);
    expect((await asAdmin(request(app).put(`/api/usuarios/${user.id}`)).send({})).status).toBe(400);
    expect((await asAdmin(request(app).get('/api/usuarios/9999'))).status).toBe(404);
    expect((await asAdmin(request(app).delete('/api/usuarios/9999'))).status).toBe(404);
  });
});

describe('normal user cannot manage users (403)', () => {
  it('cannot list users', async () => {
    expect((await asUser(request(app).get('/api/usuarios'))).status).toBe(403);
  });

  it('cannot read another user by id', async () => {
    expect((await asUser(request(app).get(`/api/usuarios/${admin.id}`))).status).toBe(403);
  });

  it('cannot create users, including admins', async () => {
    const res = await asUser(request(app).post('/api/usuarios')).send({
      nombre: 'Mallory',
      email: 'mallory@test.local',
      password: 'mallory-pass',
      rol: 'admin',
    });
    expect(res.status).toBe(403);
    const { rows } = await pool.query('SELECT 1 FROM usuarios WHERE email = $1', ['mallory@test.local']);
    expect(rows).toHaveLength(0);
  });

  it('cannot escalate their own role to admin', async () => {
    const res = await asUser(request(app).put(`/api/usuarios/${user.id}`)).send({ rol: 'admin' });
    expect(res.status).toBe(403);
    expect(await roleInDb(user.id)).toBe('user');
  });

  it('cannot update another user', async () => {
    const res = await asUser(request(app).put(`/api/usuarios/${admin.id}`)).send({ password: 'hijacked-pass' });
    expect(res.status).toBe(403);
    await loginAs(app, ADMIN);
  });

  it('cannot delete users', async () => {
    expect((await asUser(request(app).delete(`/api/usuarios/${admin.id}`))).status).toBe(403);
    expect(await roleInDb(admin.id)).toBe('admin');
  });

  it('can read only their own profile via /me', async () => {
    const res = await asUser(request(app).get('/api/usuarios/me'));
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: user.id, email: USER.email, rol: 'user' });
    expect(res.body).not.toHaveProperty('password');
  });

  it('cannot modify /me', async () => {
    expect((await asUser(request(app).put('/api/usuarios/me')).send({ rol: 'admin' })).status).toBe(403);
    expect(await roleInDb(user.id)).toBe('user');
  });
});

describe('unauthenticated access (401)', () => {
  it.each([
    ['get', '/api/usuarios'],
    ['get', '/api/usuarios/me'],
    ['post', '/api/usuarios'],
    ['put', '/api/usuarios/1'],
    ['delete', '/api/usuarios/1'],
  ])('%s %s', async (method, path) => {
    const res = await request(app)[method](path);
    expect(res.status).toBe(401);
  });
});

describe('role is enforced from the database, not the token', () => {
  it('a demoted admin loses access immediately with the old token', async () => {
    const second = await asAdmin(request(app).post('/api/usuarios')).send({
      nombre: 'Second',
      email: 'second@test.local',
      password: 'second-test-pass',
      rol: 'admin',
    });
    const secondToken = await loginAs(app, { email: 'second@test.local', password: 'second-test-pass' });

    await asAdmin(request(app).put(`/api/usuarios/${second.body.id}`)).send({ rol: 'user' });

    const res = await request(app).get('/api/usuarios').set('Authorization', `Bearer ${secondToken}`);
    expect(res.status).toBe(403);
  });
});

describe('last admin protection', () => {
  it('cannot delete the only admin (409)', async () => {
    const res = await asAdmin(request(app).delete(`/api/usuarios/${admin.id}`));
    expect(res.status).toBe(409);
    expect(await roleInDb(admin.id)).toBe('admin');
  });

  it('cannot demote the only admin (409)', async () => {
    const res = await asAdmin(request(app).put(`/api/usuarios/${admin.id}`)).send({ rol: 'user' });
    expect(res.status).toBe(409);
    expect(await roleInDb(admin.id)).toBe('admin');
  });

  it('allows demoting an admin when another admin remains', async () => {
    await asAdmin(request(app).put(`/api/usuarios/${user.id}`)).send({ rol: 'admin' });
    const res = await asAdmin(request(app).put(`/api/usuarios/${admin.id}`)).send({ rol: 'user' });
    expect(res.status).toBe(200);
    expect(await roleInDb(admin.id)).toBe('user');
  });
});
