import { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginStyle.css';
import { FaUser, FaLock } from 'react-icons/fa';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError('Credenciales incorrectas');
        }
    };

    return (
        <div className="wrapper">
            <form onSubmit={handleSubmit}>
                <h1>Iniciar sesión</h1>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <div className="input-box">
                    <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                    <FaUser className="icon" />
                </div>

                <div className="input-box">
                    <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                    <FaLock className="icon" />
                </div>
                
                <button type="submit">Ingresar</button>
            </form>

        </div>
    );
}


