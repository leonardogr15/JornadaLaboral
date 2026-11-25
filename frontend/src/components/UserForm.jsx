import { useEffect, useRef, useState } from 'react';
import { FiAlertCircle, FiSave, FiX } from 'react-icons/fi';

const VACIO = { id: null, nombre: '', email: '', password: '', rol: 'user' };

/**
 * Create or edit form. The parent remounts it (key) when the user being edited changes, so the
 * initial state is derived once from the props.
 */
export default function UserForm({ editingUser, onCreate, onUpdate, onCancel, error = '', enviando = false }) {
    const [usuario, setUsuario] = useState(() =>
        editingUser
            ? { id: editingUser.id, nombre: editingUser.nombre, email: editingUser.email, password: '', rol: editingUser.rol }
            : VACIO
    );
    const editando = Boolean(usuario.id);
    const nombreRef = useRef(null);

    // Opening the form (also from a row far down the list) moves focus, and the view, to it.
    useEffect(() => {
        nombreRef.current?.focus();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUsuario((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editando) onUpdate(usuario);
        else onCreate(usuario);
    };

    return (
        <section className="card" aria-labelledby="form-usuario-titulo">
            <div className="card-header">
                <div>
                    <h2 id="form-usuario-titulo" className="card-title">{editando ? 'Editar usuario' : 'Crear usuario'}</h2>
                    <p className="card-subtitle">
                        {editando ? 'Cambia los datos o el rol. La contraseña solo cambia si escribes una nueva.' : 'La persona podrá iniciar sesión con este correo y contraseña.'}
                    </p>
                </div>
            </div>
            <form className="card-body" onSubmit={handleSubmit}>
                {error && (
                    <div className="alert alert-error form-alert" role="alert">
                        <FiAlertCircle aria-hidden="true" />
                        <span>{error}</span>
                    </div>
                )}
                <div className="user-form-grid">
                    <div className="field">
                        <label className="field-label" htmlFor="usuario-nombre">Nombre</label>
                        <input id="usuario-nombre" ref={nombreRef} className="input" name="nombre" type="text" autoComplete="off" value={usuario.nombre} onChange={handleChange} required maxLength={100} />
                    </div>
                    <div className="field">
                        <label className="field-label" htmlFor="usuario-email">Correo electrónico</label>
                        <input id="usuario-email" className="input" name="email" type="email" autoComplete="off" value={usuario.email} onChange={handleChange} required maxLength={150} />
                    </div>
                    <div className="field">
                        <label className="field-label" htmlFor="usuario-password">{editando ? 'Nueva contraseña' : 'Contraseña'}</label>
                        <input
                            id="usuario-password"
                            className="input"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            value={usuario.password}
                            onChange={handleChange}
                            minLength={8}
                            maxLength={72}
                            required={!editando}
                            aria-describedby="usuario-password-ayuda"
                        />
                        <span id="usuario-password-ayuda" className="field-hint">
                            {editando ? 'Déjala vacía para mantener la actual.' : 'Entre 8 y 72 caracteres.'}
                        </span>
                    </div>
                    <div className="field">
                        <label className="field-label" htmlFor="usuario-rol">Rol</label>
                        <select id="usuario-rol" className="input" name="rol" value={usuario.rol} onChange={handleChange}>
                            <option value="user">Usuario</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>
                        <FiX aria-hidden="true" /> Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={enviando}>
                        <FiSave aria-hidden="true" />
                        {enviando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear usuario'}
                    </button>
                </div>
            </form>
        </section>
    );
}
