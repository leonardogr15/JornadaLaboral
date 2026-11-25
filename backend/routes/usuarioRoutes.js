const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { idParams, createUserBody, updateUserBody } = require('../validation/schemas');
const {
  obtenerPerfil,
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} = require('../controllers/usuarioController');

router.use(authenticate);

// Any authenticated user may read (never modify) their own profile.
router.get('/me', obtenerPerfil);

// User management is admin-only.
router.use(requireAdmin);

router.get('/', listarUsuarios);
router.get('/:id', validate({ params: idParams }), obtenerUsuario);
router.post('/', validate({ body: createUserBody }), crearUsuario);
router.put('/:id', validate({ params: idParams, body: updateUserBody }), actualizarUsuario);
router.delete('/:id', validate({ params: idParams }), eliminarUsuario);

module.exports = router;
