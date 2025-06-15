const Jornada = require('../models/jornadaModel');

exports.registrarJornada = async (req, res) => {
    try {
        const usuarioId   = req.user.id;
        const { horaEntrada, horaSalida } = req.body;

        const [h1, m1] = horaEntrada.split(':').map(Number);
        const [h2, m2] = horaSalida .split(':').map(Number);

        const minutosTrab = (h2 * 60 + m2) - (h1 * 60 + m1);
        const horasTrabajadas = +(minutosTrab / 60).toFixed(2);

        const nueva = await Jornada.create({
            usuarioId,
            horaEntrada,
            horaSalida,
            fecha: new Date(),
            horasTrabajadas
        });
        res.status(201).json(nueva);
    } catch (err) {
        console.error('Error registrando jornada:', err);
        res.status(500).json({ error: 'No se pudo registrar jornada' });
    }
};
