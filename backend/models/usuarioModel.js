const pool = require('../config/db_postgres');
const bcrypt = require('bcrypt');
const HttpError = require('../utils/httpError');

const PUBLIC_COLUMNS = 'id, nombre, email, rol, creado_en';
const BCRYPT_ROUNDS = 10;
const LAST_ADMIN_MESSAGE = 'No se puede eliminar o degradar al último administrador';

const findUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return result.rows[0];
};

async function findAllUsers() {
  const { rows } = await pool.query(`SELECT ${PUBLIC_COLUMNS} FROM usuarios ORDER BY id`);
  return rows;
}

async function findUserById(id) {
  const { rows } = await pool.query(`SELECT ${PUBLIC_COLUMNS} FROM usuarios WHERE id = $1`, [id]);
  return rows[0];
}

async function countAdmins(client = pool) {
  const { rows } = await client.query("SELECT COUNT(*)::int AS n FROM usuarios WHERE rol = 'admin'");
  return rows[0].n;
}

async function createUser({ nombre, email, password, rol }) {
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const { rows } = await pool.query(
    `INSERT INTO usuarios (nombre, email, password, rol)
    VALUES ($1,$2,$3,$4)
    RETURNING ${PUBLIC_COLUMNS}`,
    [nombre, email, hash, rol]
  );
  return rows[0];
}

/**
 * Runs fn inside a transaction that holds a row lock on every admin, so two
 * concurrent requests cannot each remove "the other" last admin.
 */
async function withAdminLock(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT id FROM usuarios WHERE rol = 'admin' FOR UPDATE");
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function assertNotLastAdmin(client, id) {
  const { rows } = await client.query('SELECT rol FROM usuarios WHERE id = $1', [id]);
  if (rows[0] && rows[0].rol === 'admin' && (await countAdmins(client)) <= 1) {
    throw new HttpError(409, LAST_ADMIN_MESSAGE);
  }
}

async function updateUser(id, { nombre, email, password, rol }) {
  let idx = 1;
  const fields = [];
  const values = [];

  if (nombre) {
    fields.push(`nombre = $${idx++}`);
    values.push(nombre);
  }
  if (email) {
    fields.push(`email = $${idx++}`);
    values.push(email);
  }
  if (password) {
    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    fields.push(`password = $${idx++}`);
    values.push(hash);
  }
  if (rol) {
    fields.push(`rol = $${idx++}`);
    values.push(rol);
  }

  if (fields.length === 0) return findUserById(id);

  values.push(id);
  return withAdminLock(async (client) => {
    if (rol && rol !== 'admin') await assertNotLastAdmin(client, id);
    const { rows } = await client.query(
      `UPDATE usuarios SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING ${PUBLIC_COLUMNS}`,
      values
    );
    return rows[0];
  });
}

/** Returns true when a row was removed. */
async function deleteUser(id) {
  return withAdminLock(async (client) => {
    await assertNotLastAdmin(client, id);
    const { rowCount } = await client.query('DELETE FROM usuarios WHERE id = $1', [id]);
    return rowCount > 0;
  });
}

module.exports = {
  findUserByEmail,
  findAllUsers,
  findUserById,
  countAdmins,
  createUser,
  updateUser,
  deleteUser,
};
