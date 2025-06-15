const mongoose = require('mongoose');

const jornadaSchema = new mongoose.Schema({
    horaEntrada: { type: String, required: true },
    horaSalida: { type: String, required: true },
    fecha: { type: Date,   default: Date.now },
    usuarioId: { type: Number, required: true },
    horasTrabajadas: { type: Number, required: true }
},
{
    collection: 'jornada_laboral'
});

module.exports = mongoose.model('Jornada', jornadaSchema);
