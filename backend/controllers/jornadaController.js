const Jornada = require('../models/jornadaModel');
const { toMinutes } = require('../validation/schemas');

/** Lists only the shifts that belong to the authenticated user. */
exports.listarJornadas = async (req, res) => {
  const jornadas = await Jornada.find({ usuarioId: req.user.id }).sort({ fecha: 1 }).lean();
  res.json(jornadas);
};

/**
 * Registers a shift for the authenticated user. The owner always comes from
 * the verified token, never from the request body. Times are already
 * validated (HH:MM, exit after entry) by the jornadaBody schema.
 */
exports.registrarJornada = async (req, res) => {
  const { horaEntrada, horaSalida, fecha } = req.body;
  const minutos = toMinutes(horaSalida) - toMinutes(horaEntrada);

  const nueva = await Jornada.create({
    usuarioId: req.user.id,
    horaEntrada,
    horaSalida,
    fecha: fecha ? new Date(`${fecha}T00:00:00Z`) : new Date(),
    horasTrabajadas: +(minutos / 60).toFixed(2),
  });

  res.status(201).json(nueva);
};
