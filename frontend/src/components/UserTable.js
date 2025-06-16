import { FaTrash, FaEdit } from 'react-icons/fa';

export default function UserTable({ usuarios, onDelete, onEdit }) {

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
                                    <button onClick={() => onEdit(usuario)}>
                                    <FaEdit />
                                    </button>
                                    <button onClick={() => onDelete(usuario.id)}>
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