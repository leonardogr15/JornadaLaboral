require('dotenv').config();

const mongoose = require('mongoose');
const { createApp } = require('./app');
const connectMongo = require('./config/db_mongo');
const pool = require('./config/db_postgres');
const { getJwtSecret } = require('./config/security');
const { bootstrapDatabase } = require('./db/bootstrap');

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  // Fail fast on an insecure configuration.
  getJwtSecret();

  await connectMongo();
  await bootstrapDatabase();

  const server = createApp().listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await Promise.allSettled([pool.end(), mongoose.disconnect()]);
      process.exit(0);
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start().catch((err) => {
  console.error('Startup failed:', err.message);
  process.exit(1);
});
