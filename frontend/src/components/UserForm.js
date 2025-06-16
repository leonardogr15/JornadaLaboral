import { useState, useEffect } from 'react';
import { FaUser, FaLock, FaArrowLeft } from 'react-icons/fa';
import '../styles/ControlPanelStyle.css';
import { useNavigate } from 'react-router-dom';

export default function UserForm({ editingUser, onCreate, onUpdate }) {
    const [nuevoUsuario, setNuevoUsuario] = useState({ id: null, nombre: '', email: '', password: '', rol: 'user'});
    const navigate = useNavigate();

    useEffect(() => {
        if (editingUser) {
            setNuevoUsuario({ id: editingUser.id, nombre: editingUser.nombre, email: editingUser.email, password: '', rol: editingUser.rol });
        } else {
        setNuevoUsuario({ id: null, nombre: '', email: '', password: '', rol: 'user' });
        }
    }, [editingUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNuevoUsuario(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (nuevoUsuario.id) {
            onUpdate(nuevoUsuario);
        } else {
            onCreate(nuevoUsuario);
        }
        setNuevoUsuario({ id: null, nombre: '', email: '', password: '', rol: 'user' });
    };

    return (
        <div>
            <h3>{nuevoUsuario.id ? 'Editar Usuario' : 'Crear Usuario'}</h3>
            <form onSubmit={handleSubmit}>
                <div className="input-row-user">
                    <div className="input-box-user">
                        <input name="nombre" type="text" placeholder="Nombre" value={nuevoUsuario.nombre} onChange={handleChange} required />
                        <FaUser className="icon" />
                    </div>

                    <div className="input-box-user">
                        <input name="email" type="email" placeholder="Correo electrónico" value={nuevoUsuario.email} onChange={handleChange} required />
                        <FaUser className="icon" />
                    </div>

                    <div className="input-box-user">
                        <input name="password" type="password" placeholder={nuevoUsuario.id ? 'Nueva contraseña' : 'Contraseña'} value={nuevoUsuario.password} onChange={handleChange} {...(!nuevoUsuario.id && { required: true })} />
                        <FaLock className="icon" />
                    </div>

                    <select className='input-select-user' name="rol" value={nuevoUsuario.rol} onChange={handleChange}>
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>

                <div className="buttom-row">
                    {/* <button type="button" className="back-btn" onClick={() => navigate('/dashboard')}>
                        <FaArrowLeft className="back-icon" /> Volver
                    </button> */}
                    <button type="submit">{nuevoUsuario.id ? 'Actualizar' : 'Crear'}</button>
                </div>
            </form>
        </div>
    );
}