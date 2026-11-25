const express = require('express');
const mongoose = require('mongoose');
const pool = require('../config/db_postgres');

const router = express.Router();
const CHECK_TIMEOUT_MS = 2000;

function withTimeout(promise) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), CHECK_TIMEOUT_MS);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function check(fn) {
  try {
    await withTimeout(fn());
    return 'up';
  } catch {
    return 'down';
  }
}

// Liveness + readiness: 200 only when both datastores answer.
router.get('/', async (req, res) => {
  const [postgres, mongo] = await Promise.all([
    check(() => pool.query('SELECT 1')),
    check(() => {
      if (mongoose.connection.readyState !== 1) throw new Error('not connected');
      return mongoose.connection.db.command({ ping: 1 });
    }),
  ]);
  const ok = postgres === 'up' && mongo === 'up';
  res.status(ok ? 200 : 503).json({ status: ok ? 'ok' : 'degraded', postgres, mongo });
});

module.exports = router;
