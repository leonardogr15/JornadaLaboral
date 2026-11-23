const express = require('express');
const cors = require('cors');
const connectMongo = require('./config/db_mongo');
const { bootstrapDatabase } = require('./db/bootstrap');
const authRoutes = require('./routes/authRoutes');
const jornadaRoutes = require('./routes/jornadaRoutes');
const userRoutes    = require('./routes/usuarioRoutes');
const app = express();

require('dotenv').config();
const { getJwtSecret } = require('./config/security');

// Fail fast on an insecure configuration.
try {
  getJwtSecret();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/jornadas', jornadaRoutes);
app.use('/api/usuarios', userRoutes);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});


const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectMongo();
    await bootstrapDatabase();
  } catch (err) {
    console.error('Startup failed:', err.message);
    process.exit(1);
  }
  app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en el puerto ${PORT}`);
  });
})();
