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
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            const { data } = await api.get('/usuarios');
            setUsuarios(data);
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
            <UserForm onCreate={createUser} onUpdate={updateUser} editingUser={usuarioEditando} />
            <hr />
            <br/>
            <UserTable usuarios={usuarios} onDelete={deleteUser} onEdit={(usr) => setUsuarioEditando(usr)} />
        </div>
    );
}