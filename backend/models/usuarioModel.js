const pool = require('../config/db_postgres');
const bcrypt = require('bcrypt');

const findUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return result.rows[0];
};

async function findAllUsers() {
  const { rows } = await pool.query(
    `SELECT id, nombre, email, rol, creado_en
    FROM usuarios
    ORDER BY id`
  );
  return rows;
}

async function findUserById(id) {
  const { rows } = await pool.query(
    `SELECT id, nombre, email, rol, creado_en
    FROM usuarios
    WHERE id = $1`,
    [id]
  );
  return rows[0];
}

async function createUser({ nombre, email, password, rol }) {
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `INSERT INTO usuarios (nombre, email, password, rol)
    VALUES ($1,$2,$3,$4)
    RETURNING id, nombre, email, rol, creado_en`,
    [nombre, email, hash, rol]
  );
  return rows[0];
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
    const hash = await bcrypt.hash(password, 10);
    fields.push(`password = $${idx++}`);
    values.push(hash);
  }
  if (rol) {
    fields.push(`rol = $${idx++}`);
    values.push(rol);
  }

  if (fields.length === 0) return findUserById(id);

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE usuarios SET ${fields.join(', ')}
    WHERE id = $${idx}
    RETURNING id, nombre, email, rol, creado_en`,
    values
  );
  return rows[0];
}

async function deleteUser(id) {
  await pool.query(`DELETE FROM usuarios WHERE id = $1`, [id]);
  return;
}

module.exports = { findUserByEmail, findAllUsers, findUserById, createUser, updateUser, deleteUser };
