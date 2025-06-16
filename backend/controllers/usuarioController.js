const { findAllUsers, findUserById, createUser, updateUser, deleteUser } = require('../models/usuarioModel');

exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await findAllUsers();
    res.json(usuarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
};

exports.obtenerUsuario = async (req, res) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

exports.crearUsuario = async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  try {
    const nuevo = await createUser({ nombre, email, password, rol });
    res.status(201).json(nuevo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

exports.actualizarUsuario = async (req, res) => {
  try {
    const actualizado = await updateUser(req.params.id, req.body);
    res.json(actualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

exports.eliminarUsuario = async (req, res) => {
  try {
    await deleteUser(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};
