import { useEffect, useState } from 'react';
import api from '../api';
import UserForm from '../components/UserForm';
import UserTable from '../components/UserTable';
import '../styles/SettingsStyle.css';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {

    const [usuarios, setUsuarios] = useState([]);
    const [usuarioEditando, setUsuarioEditando] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get('/usuarios');
                setUsuarios(data);
            } catch (err) {
                // The API decides who may manage users; the page only reports it.
                setError(err.response?.status === 403
                    ? 'No tienes permisos para gestionar usuarios.'
                    : 'No se pudieron cargar los usuarios.');
            }
        })();
    }, []);

    const deleteUser = async (id) => {
        if (window.confirm('¿Eliminar este usuario?')) {
            try {
                await api.delete(`/usuarios/${id}`);
                setUsuarios((prev) => prev.filter((u) => u.id !== id));
            } catch (err) {
            console.error('Error eliminando usuario:', err);
            }
        }
    };

    const createUser = async (usuario) => {
        await api.post('/usuarios', usuario);
        const { data } = await api.get('/usuarios');
        setUsuarios(data);
    };

    const updateUser = async (usuario) => {
        await api.put(`/usuarios/${usuario.id}`, usuario);
        setUsuarioEditando(null);
        const { data } = await api.get('/usuarios');
        setUsuarios(data);
    };


    return (
        <div className="form-panel">
            <div className="panel-header">
                <button type="button" className="back-btn" onClick={() => navigate('/dashboard')}>
                    <FaArrowLeft className="back-icon" /> Volver
                </button>
            </div>
            {error && <p role="alert" className="error-message">{error}</p>}
            <UserForm key={usuarioEditando?.id ?? 'new'} onCreate={createUser} onUpdate={updateUser} editingUser={usuarioEditando} />
            <hr />
            <br/>
            <UserTable usuarios={usuarios} onDelete={deleteUser} onEdit={(usr) => setUsuarioEditando(usr)} />
        </div>
    );
}