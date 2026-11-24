const bcrypt = require('bcrypt');
const pool = require('../config/db_postgres');

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (rol IN ('user', 'admin')),
  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);
`;

const MIN_DEMO_PASSWORD_LENGTH = 12;

/** Creates the users table when it does not exist yet (idempotent). */
async function ensureSchema() {
  await pool.query(SCHEMA_SQL);
}

/**
 * Seeds a demo admin only when no admin exists. The password is never
 * hardcoded: it comes from DEMO_ADMIN_PASSWORD and is stored as a bcrypt hash.
 * Returns true when an admin was created.
 */
async function seedDemoAdmin({
  email = (process.env.DEMO_ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase(),
  password = process.env.DEMO_ADMIN_PASSWORD,
  nombre = 'Administrador',
} = {}) {
  const { rows } = await pool.query("SELECT 1 FROM usuarios WHERE rol = 'admin' LIMIT 1");
  if (rows.length > 0) return false;

  if (!password || password.length < MIN_DEMO_PASSWORD_LENGTH) {
    console.warn(
      `No admin exists and DEMO_ADMIN_PASSWORD is unset or shorter than ${MIN_DEMO_PASSWORD_LENGTH} chars; skipping admin seed.`
    );
    return false;
  }

  const hash = await bcrypt.hash(password, 10);
  const { rowCount } = await pool.query(
    `INSERT INTO usuarios (nombre, email, password, rol)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO NOTHING`,
    [nombre, email, hash]
  );
  if (rowCount === 0) {
    console.warn(`No admin exists, but ${email} is already taken by a non-admin user; skipping admin seed.`);
    return false;
  }
  console.log(`Demo admin seeded (${email}).`);
  return true;
}

async function bootstrapDatabase() {
  await ensureSchema();
  await seedDemoAdmin();
}

module.exports = { ensureSchema, seedDemoAdmin, bootstrapDatabase };
