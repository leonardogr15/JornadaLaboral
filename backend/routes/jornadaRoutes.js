const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Jornada = require('../models/jornadaModel');


router.get('/', authMiddleware, async (data, res) => {
  try {
    const jornadas_todas = await Jornada.find();
    const jornadas = await Jornada.find({ usuarioId: data.user.id });
    res.json(jornadas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener jornadas' });
  }
});

module.exports = router;
