import { useEffect, useRef, useState } from 'react';
import { FiAlertCircle, FiCheckCircle, FiUserPlus } from 'react-icons/fi';
import api from '../api';
import AppLayout from '../components/AppLayout';
import UserForm from '../components/UserForm';
import UserTable from '../components/UserTable';

/** The API's own message when it sent one (e.g. 409 duplicate email), otherwise a generic one. */
function mensajeDeError(err, porDefecto) {
    return err?.response?.data?.error || porDefecto;
}

export default function SettingsPage() {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [sinPermiso, setSinPermiso] = useState(false);
    const [aviso, setAviso] = useState('');
    // null: form closed; 'new': create; a user object: edit that user.
    const [formulario, setFormulario] = useState(null);
    const [errorFormulario, setErrorFormulario] = useState('');
    const [enviando, setEnviando] = useState(false);
    const tituloRef = useRef(null);

    const recargar = async () => {
        const { data } = await api.get('/usuarios');
        setUsuarios(data);
    };

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get('/usuarios');
                setUsuarios(data);
            } catch (err) {
                // The API decides who may manage users; the page only reports it.
                if (err.response?.status === 403) {
                    setSinPermiso(true);
                    setError('No tienes permisos para gestionar usuarios.');
                } else {
                    setError('No se pudieron cargar los usuarios.');
                }
            } finally {
                setCargando(false);
            }
        })();
    }, []);

    const abrir = (valor) => {
        setAviso('');
        setErrorFormulario('');
        setFormulario(valor);
    };

    const cerrar = () => {
        setFormulario(null);
        setErrorFormulario('');
        tituloRef.current?.focus();
    };

    const guardar = async (accion, textoOk, textoError) => {
        setEnviando(true);
        setErrorFormulario('');
        try {
            await accion();
            await recargar();
            setFormulario(null);
            setAviso(textoOk);
            tituloRef.current?.focus();
        } catch (err) {
            setErrorFormulario(mensajeDeError(err, textoError));
        } finally {
            setEnviando(false);
        }
    };

    const createUser = (usuario) =>
        guardar(() => api.post('/usuarios', usuario), `Usuario «${usuario.nombre}» creado.`, 'No se pudo crear el usuario.');

    const updateUser = (usuario) =>
        guardar(() => api.put(`/usuarios/${usuario.id}`, usuario), `Usuario «${usuario.nombre}» actualizado.`, 'No se pudo actualizar el usuario.');

    const deleteUser = async (usuario) => {
        if (!window.confirm(`¿Eliminar a ${usuario.nombre}? Esta acción no se puede deshacer.`)) return;
        setAviso('');
        setError('');
        try {
            await api.delete(`/usuarios/${usuario.id}`);
            setUsuarios((prev) => prev.filter((u) => u.id !== usuario.id));
            setAviso(`Usuario «${usuario.nombre}» eliminado.`);
        } catch (err) {
            setError(mensajeDeError(err, 'No se pudo eliminar el usuario.'));
        }
    };

    return (
        <AppLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title" ref={tituloRef} tabIndex={-1}>Usuarios</h1>
                    <p className="page-subtitle">Crea cuentas, cambia roles y da de baja usuarios.</p>
                </div>
                {!sinPermiso && formulario === null && (
                    <button type="button" className="btn btn-primary" onClick={() => abrir('new')}>
                        <FiUserPlus aria-hidden="true" /> Nuevo usuario
                    </button>
                )}
            </div>

            <div className="users-layout">
                {error && (
                    <p role="alert" className="alert alert-error">
                        <FiAlertCircle aria-hidden="true" />
                        <span>{error}</span>
                    </p>
                )}
                <div role="status" className="status-slot">
                    {aviso && (
                        <p className="alert alert-success">
                            <FiCheckCircle aria-hidden="true" />
                            <span>{aviso}</span>
                        </p>
                    )}
                </div>

                {formulario !== null && (
                    <UserForm
                        key={formulario === 'new' ? 'new' : formulario.id}
                        editingUser={formulario === 'new' ? null : formulario}
                        onCreate={createUser}
                        onUpdate={updateUser}
                        onCancel={cerrar}
                        error={errorFormulario}
                        enviando={enviando}
                    />
                )}

                {!sinPermiso && (
                    <UserTable usuarios={usuarios} cargando={cargando} onDelete={deleteUser} onEdit={(u) => abrir(u)} />
                )}
            </div>
        </AppLayout>
    );
}
