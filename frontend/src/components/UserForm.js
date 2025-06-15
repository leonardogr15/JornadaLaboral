import { useState } from 'react';
import { FaUser, FaLock, FaArrowLeft } from 'react-icons/fa';
import '../styles/ControlPanelStyle.css';
import { useNavigate } from 'react-router-dom';

export default function UserForm() {
    const [nuevoUsuario, setNuevoUsuario] = useState({ email: '', password: '', rol: 'user' });
    const [modoEdicion] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setNuevoUsuario({ ...nuevoUsuario, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(modoEdicion ? 'Actualizar usuario:' : 'Crear usuario:', nuevoUsuario);
        setNuevoUsuario({ email: '', password: '', rol: 'user' });
    };

    const irAlDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <div>
            <h3>{modoEdicion ? 'Editar Usuario' : 'Crear Usuario'}</h3>

            <form onSubmit={handleSubmit}>
                <div className="input-row">
                    <div className="input-box">
                        <input type="email" placeholder="Correo electrónico" value={nuevoUsuario.email} onChange={handleChange} required/>
                        <FaUser className="icon" />
                    </div>

                    <div className="input-box">
                        <input type="password" placeholder="Contraseña" value={nuevoUsuario.password} onChange={handleChange} required/>
                        <FaLock className="icon" />
                    </div>
                
                    <select name="rol" value={nuevoUsuario.rol} onChange={handleChange}>
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>
                
                <div className="buttom-row">
                    <button className="back-btn" onClick={irAlDashboard}>
                        <FaArrowLeft className="back-icon" />
                        Volver
                    </button>
                    <button type="submit">{modoEdicion ? 'Actualizar' : 'Crear'}</button>
                </div>
            </form>
        </div>
    );
}