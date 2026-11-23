const jwt = require('jsonwebtoken');
const { JWT_ALGORITHM, getJwtSecret } = require('../config/security');
const { findUserById } = require('../models/usuarioModel');

/**
 * Verifies the Bearer token (HS256 only) and exposes its claims as req.user.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    const claims = jwt.verify(token, getJwtSecret(), { algorithms: [JWT_ALGORITHM] });
    if (!Number.isInteger(claims.id)) throw new Error('invalid subject');
    req.user = claims;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

/**
 * Authorizes by role. The role is read from the database for the user id in
 * the verified token, so a demoted or deleted account loses access at once
 * instead of when its token expires. Nothing the client sends (body, query,
 * unsigned headers) is trusted for authorization.
 */
function requireRole(...roles) {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' });
    try {
      const current = await findUserById(req.user.id);
      if (!current) return res.status(401).json({ error: 'No autenticado' });
      if (!roles.includes(current.rol)) {
        return res.status(403).json({ error: 'Permisos insuficientes' });
      }
      req.user.rol = current.rol;
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = authenticate;
module.exports.authenticate = authenticate;
module.exports.requireRole = requireRole;
module.exports.requireAdmin = requireRole('admin');
