import { FaTrash, FaEdit } from 'react-icons/fa';
import { useState } from 'react';

export default function UserTable() {
    const [usuarios] = useState([
        { id: 1, email: 'admin@correo.com', rol: 'admin' },
        { id: 2, email: 'user@corr.com', rol: 'user' },
    ]);

    const editarUsuario = (usuario) => {
        console.log('Editar usuario:', usuario);
    };

    const eliminarUsuario = (id) => {
        if (window.confirm('¿Eliminar este usuario?')) {
        console.log('Eliminar usuario con ID:', id);
        }
    };

    return (
        <div>
            <h3>Usuarios Registrados</h3>
            <table className="jornada-table">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((usuario) => (
                        <tr key={usuario.id}>
                        <td>{usuario.email}</td>
                        <td>{usuario.rol}</td>
                        <td>
                            <button onClick={() => editarUsuario(usuario)}>
                            <FaEdit />
                            </button>
                            <button onClick={() => eliminarUsuario(usuario.id)}>
                            <FaTrash />
                            </button>
                        </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}