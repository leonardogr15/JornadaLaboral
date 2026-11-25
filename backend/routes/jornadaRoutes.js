const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { jornadaBody } = require('../validation/schemas');
const { listarJornadas, registrarJornada } = require('../controllers/jornadaController');

router.use(authenticate);

router.get('/', listarJornadas);
router.post('/', validate({ body: jornadaBody }), registrarJornada);

module.exports = router;
