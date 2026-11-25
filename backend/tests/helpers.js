const request = require('supertest');
const mongoose = require('mongoose');
const pool = require('../config/db_postgres');
const connectMongo = require('../config/db_mongo');
const { ensureSchema } = require('../db/bootstrap');
const { createUser } = require('../models/usuarioModel');
const Jornada = require('../models/jornadaModel');
const { createApp } = require('../app');

const ADMIN = { nombre: 'Admin', email: 'admin@test.local', password: 'admin-test-pass', rol: 'admin' };
const USER = { nombre: 'Ana', email: 'ana@test.local', password: 'user-test-pass', rol: 'user' };

async function connect() {
  await connectMongo();
  await ensureSchema();
}

async function resetData() {
  await pool.query('TRUNCATE usuarios RESTART IDENTITY');
  await Jornada.deleteMany({});
}

async function disconnect() {
  await pool.end();
  await mongoose.disconnect();
}

/** Creates the default admin and normal user directly in the database. */
async function seedUsers() {
  const admin = await createUser(ADMIN);
  const user = await createUser(USER);
  return { admin, user };
}

async function loginAs(app, { email, password }) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  if (res.status !== 200) throw new Error(`login failed for ${email}: ${res.status}`);
  return res.body.token;
}

module.exports = { ADMIN, USER, createApp, connect, resetData, disconnect, seedUsers, loginAs, request };
