import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import api from '../api';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [errores, setErrores] = useState({});
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const validar = () => {
    const e = {};
    if (!email.trim()) e.email = 'Introduce tu correo electrónico.';
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = 'Introduce un correo electrónico válido.';
    if (!password) e.password = 'Introduce tu contraseña.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const encontrados = validar();
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) {
      (encontrados.email ? emailRef : passwordRef).current?.focus();
      return;
    }

    setEnviando(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch {
      setError('Credenciales incorrectas');
      setEnviando(false);
    }
  };

  return (
    <div className="card login-card">
      <h1>Iniciar sesión</h1>
      <p className="lead">Accede con tu cuenta de la empresa.</p>

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="alert alert-error" role="alert">
            <FiAlertCircle aria-hidden="true" />
            <span>{error}. Revisa el correo y la contraseña.</span>
          </div>
        )}

        <div className="field">
          <label className="field-label" htmlFor="login-email">Correo electrónico</label>
          <input
            id="login-email"
            ref={emailRef}
            className="input"
            type="email"
            autoComplete="username"
            placeholder="nombre@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-invalid={errores.email ? 'true' : undefined}
            aria-describedby={errores.email ? 'login-email-error' : undefined}
          />
          {errores.email && <span id="login-email-error" className="field-error" role="alert">{errores.email}</span>}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="login-password">Contraseña</label>
          <div className="password-field">
            <input
              id="login-password"
              ref={passwordRef}
              className="input"
              type={verPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-invalid={errores.password ? 'true' : undefined}
              aria-describedby={errores.password ? 'login-password-error' : undefined}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setVerPassword((v) => !v)}
              aria-label="Mostrar contraseña"
              aria-pressed={verPassword}
            >
              {verPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
            </button>
          </div>
          {errores.password && <span id="login-password-error" className="field-error" role="alert">{errores.password}</span>}
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={enviando}>
          <FiLogIn aria-hidden="true" />
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
