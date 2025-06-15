const pool = require('../config/db_postgres');

const findUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return result.rows[0];
};

module.exports = { findUserByEmail };
