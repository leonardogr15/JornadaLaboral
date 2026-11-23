const { findAllUsers, findUserById, createUser, updateUser, deleteUser } = require('../models/usuarioModel');

function sendError(res, err, fallback) {
  if (err.status) return res.status(err.status).json({ error: err.message });
  console.error(err);
  return res.status(500).json({ error: fallback });
}

exports.obtenerPerfil = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    sendError(res, err, 'Error al obtener usuario');
  }
};

exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await findAllUsers();
    res.json(usuarios);
  } catch (err) {
    sendError(res, err, 'Error al listar usuarios');
  }
};

exports.obtenerUsuario = async (req, res) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    sendError(res, err, 'Error al obtener usuario');
  }
};

exports.crearUsuario = async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  try {
    const nuevo = await createUser({ nombre, email, password, rol });
    res.status(201).json(nuevo);
  } catch (err) {
    sendError(res, err, 'Error al crear usuario');
  }
};

exports.actualizarUsuario = async (req, res) => {
  try {
    const actualizado = await updateUser(req.params.id, req.body);
    if (!actualizado) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(actualizado);
  } catch (err) {
    sendError(res, err, 'Error al actualizar usuario');
  }
};

exports.eliminarUsuario = async (req, res) => {
  try {
    const removed = await deleteUser(req.params.id);
    if (!removed) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(204).send();
  } catch (err) {
    sendError(res, err, 'Error al eliminar usuario');
  }
};
