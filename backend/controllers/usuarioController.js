const { findAllUsers, findUserById, createUser, updateUser, deleteUser } = require('../models/usuarioModel');
const HttpError = require('../utils/httpError');

const NOT_FOUND = 'Usuario no encontrado';

// Express 5 forwards rejected promises to the error handler, so handlers only
// throw; status mapping lives in middlewares/errorHandler.js.

exports.obtenerPerfil = async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) throw new HttpError(404, NOT_FOUND);
  res.json(user);
};

exports.listarUsuarios = async (req, res) => {
  res.json(await findAllUsers());
};

exports.obtenerUsuario = async (req, res) => {
  const user = await findUserById(req.params.id);
  if (!user) throw new HttpError(404, NOT_FOUND);
  res.json(user);
};

exports.crearUsuario = async (req, res) => {
  const nuevo = await createUser(req.body);
  res.status(201).json(nuevo);
};

exports.actualizarUsuario = async (req, res) => {
  const actualizado = await updateUser(req.params.id, req.body);
  if (!actualizado) throw new HttpError(404, NOT_FOUND);
  res.json(actualizado);
};

exports.eliminarUsuario = async (req, res) => {
  const removed = await deleteUser(req.params.id);
  if (!removed) throw new HttpError(404, NOT_FOUND);
  res.status(204).send();
};
