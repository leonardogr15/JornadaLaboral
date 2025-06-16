import { FaTrash, FaEdit } from 'react-icons/fa';
import { useState,useEffect } from 'react';
import api from '../api';

export default function UserTable() {
    const [usuarios, setUsuarios] = useState([]);
    const [error, setError] = useState('');

    const editarUsuario = (usuario) => {
        console.log('Editar usuario:', usuario);
    };

    const eliminarUsuario = async (id) => {
        if (window.confirm('¿Eliminar este usuario?')) {
            try {
                await api.delete(`/usuarios/${id}`);
                setUsuarios((prev) => prev.filter((u) => u.id !== id));
            } catch (err) {
            console.error('Error eliminando usuario:', err);
            }
        }
    };

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const { data } = await api.get('/usuarios');
                setUsuarios(data);
            } catch (err) {
                console.error('Error al obtener usuarios:', err);
                setError('No se pudieron cargar los usuarios');
            }
        };
        fetchUsuarios();
    }, []);

    return (
        <div>
            <h3>Usuarios Registrados</h3>
            <table className="jornada-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((usuario) => (
                        <tr key={usuario.id}>
                            <td>{usuario.nombre}</td>
                            <td>{usuario.email}</td>
                            <td>{usuario.rol}</td>
                            <td>
                                <div className="button-row-table">
                                    <button onClick={() => editarUsuario(usuario)}>
                                    <FaEdit />
                                    </button>
                                    <button onClick={() => eliminarUsuario(usuario.id)}>
                                    <FaTrash />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}