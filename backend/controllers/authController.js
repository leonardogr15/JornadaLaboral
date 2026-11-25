const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findUserByEmail } = require('../models/usuarioModel');
const { JWT_ALGORITHM, JWT_EXPIRES_IN, getJwtSecret } = require('../config/security');
const HttpError = require('../utils/httpError');

const INVALID_CREDENTIALS = 'Credenciales inválidas';
// Compared against when the email is unknown, so both failure paths cost one
// bcrypt comparison and response timing does not reveal registered emails.
const DUMMY_HASH = bcrypt.hashSync('timing-equalizer-not-a-real-password', 10);

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);
  const passwordMatch = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
  if (!user || !passwordMatch) throw new HttpError(401, INVALID_CREDENTIALS);

  const token = jwt.sign({ id: user.id, rol: user.rol }, getJwtSecret(), {
    algorithm: JWT_ALGORITHM,
    expiresIn: JWT_EXPIRES_IN,
  });

  res.json({ token });
};
