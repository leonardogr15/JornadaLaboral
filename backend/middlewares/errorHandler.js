const { ZodError } = require('zod');
const HttpError = require('../utils/httpError');

const PG_UNIQUE_VIOLATION = '23505';

function notFound(req, res) {
  res.status(404).json({ error: 'Recurso no encontrado' });
}

/**
 * Single place that maps errors to HTTP responses:
 * 400 validation, 401/403/404/409 from HttpError, 409 duplicate email,
 * and a generic 500 that never leaks internal error messages.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Datos inválidos',
      details: err.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
    });
  }

  if (err instanceof HttpError) {
    const body = { error: err.message };
    if (err.details) body.details = err.details;
    return res.status(err.status).json(body);
  }

  // Malformed JSON or oversized body from express.json().
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Cuerpo de la petición demasiado grande' });
  }

  if (err.code === PG_UNIQUE_VIOLATION) {
    return res.status(409).json({ error: 'El email ya está registrado' });
  }

  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = { notFound, errorHandler };
