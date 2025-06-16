const express = require('express');
const cors = require('cors');
const connectMongo = require('./config/db_mongo');
const authRoutes = require('./routes/authRoutes');
const jornadaRoutes = require('./routes/jornadaRoutes');
const userRoutes    = require('./routes/usuarioRoutes');
const app = express();

require('dotenv').config();

connectMongo();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/jornadas', jornadaRoutes);
app.use('/api/usuarios', userRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});
