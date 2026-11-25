const jwt = require('jsonwebtoken');
const { JWT_ALGORITHM, getJwtSecret } = require('../config/security');
const { findUserById } = require('../models/usuarioModel');

/**
 * Verifies the Bearer token (HS256 only) and loads the account it names.
 * The user is re-read from PostgreSQL on every request, so a deleted account
 * loses access at once on every route instead of when its token expires, and
 * req.user.rol always reflects the current role, never the token claim.
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  let claims;
  try {
    claims = jwt.verify(token, getJwtSecret(), { algorithms: [JWT_ALGORITHM] });
    if (!Number.isInteger(claims.id)) throw new Error('invalid subject');
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  try {
    const current = await findUserById(claims.id);
    if (!current) return res.status(401).json({ error: 'No autenticado' });
    req.user = { id: current.id, email: current.email, rol: current.rol };
    return next();
  } catch (err) {
    return next(err);
  }
}

/**
 * Authorizes by role. Must run after `authenticate`, which loaded the current
 * role from the database; nothing the client sends is trusted for authorization.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' });
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Permisos insuficientes' });
    }
    return next();
  };
}

module.exports = authenticate;
module.exports.authenticate = authenticate;
module.exports.requireRole = requireRole;
module.exports.requireAdmin = requireRole('admin');
