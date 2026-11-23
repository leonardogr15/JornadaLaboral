const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middlewares/authMiddleware');
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
router.get('/:id', obtenerUsuario);
router.post('/', crearUsuario);
router.put('/:id', actualizarUsuario);
router.delete('/:id', eliminarUsuario);

module.exports = router;
