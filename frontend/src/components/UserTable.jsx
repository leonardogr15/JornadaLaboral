import { FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';
import { initials, roleLabel } from '../utils/format';

export default function UserTable({ usuarios, onDelete, onEdit, cargando = false }) {
    return (
        <section className="card history" aria-labelledby="usuarios-titulo">
            <div className="card-header">
                <div>
                    <h2 id="usuarios-titulo" className="card-title">Usuarios registrados</h2>
                    <p className="card-subtitle">{usuarios.length === 1 ? '1 usuario' : `${usuarios.length} usuarios`}</p>
                </div>
            </div>
            <div className="card-body">
                {usuarios.length === 0 ? (
                    <div className="empty-state">
                        <FiUsers aria-hidden="true" />
                        <p className="empty-state-title">{cargando ? 'Cargando usuarios…' : 'No hay usuarios para mostrar'}</p>
                    </div>
                ) : (
                    <table className="table table-stack">
                        <thead>
                            <tr>
                                <th scope="col">Nombre</th>
                                <th scope="col">Rol</th>
                                <th scope="col" className="col-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map((usuario) => (
                                <tr key={usuario.id}>
                                    <td className="cell-full">
                                        <span className="user-cell">
                                            <span className="avatar" aria-hidden="true">{initials(usuario.nombre)}</span>
                                            <span className="min-w-0">
                                                <span className="cell-primary">{usuario.nombre}</span>
                                                <span className="cell-secondary">{usuario.email}</span>
                                            </span>
                                        </span>
                                    </td>
                                    <td data-label="Rol">
                                        <span className={`badge ${usuario.rol === 'admin' ? 'badge-admin' : 'badge-user'}`}>{roleLabel(usuario.rol)}</span>
                                    </td>
                                    <td className="cell-full col-end">
                                        <div className="row-actions">
                                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onEdit(usuario)} aria-label={`Editar a ${usuario.nombre}`}>
                                                <FiEdit2 aria-hidden="true" /> Editar
                                            </button>
                                            <button type="button" className="btn btn-danger-ghost btn-sm" onClick={() => onDelete(usuario)} aria-label={`Eliminar a ${usuario.nombre}`}>
                                                <FiTrash2 aria-hidden="true" /> Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    );
}
