const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/authRoutes');
const jornadaRoutes = require('./routes/jornadaRoutes');
const userRoutes = require('./routes/usuarioRoutes');
const healthRoutes = require('./routes/healthRoutes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

/** Parses CORS_ORIGINS ("https://a.com,https://b.com") into an allowlist. */
function parseOrigins(value) {
  return (value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

/**
 * Builds the Express application without opening a port or a database
 * connection, so it can be imported by tests (see server.js for startup).
 */
function createApp() {
  const app = express();
  const allowedOrigins = parseOrigins(process.env.CORS_ORIGINS);

  app.disable('x-powered-by');
  app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);

  app.use(helmet());
  app.use(
    cors({
      // Requests without an Origin header (curl, server-to-server) are allowed;
      // browsers are restricted to the allowlist.
      origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)),
    })
  );
  app.use(express.json({ limit: '10kb' }));

  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/jornadas', jornadaRoutes);
  app.use('/api/usuarios', userRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp, parseOrigins };
