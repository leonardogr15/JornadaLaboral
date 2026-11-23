const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findUserByEmail } = require('../models/usuarioModel');
const { JWT_ALGORITHM, JWT_EXPIRES_IN, getJwtSecret } = require('../config/security');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ message: 'Usuario no encontrado' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user.id, rol: user.rol }, getJwtSecret(), {
      algorithm: JWT_ALGORITHM,
      expiresIn: JWT_EXPIRES_IN,
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor: '+err.message  });
  }
};
