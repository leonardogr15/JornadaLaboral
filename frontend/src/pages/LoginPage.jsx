import { useEffect } from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import LoginForm from '../components/LoginForm';
import { BrandMark } from '../components/AppLayout';

export default function LoginPage() {
  useEffect(() => {
    document.title = 'Iniciar sesión · Jornada Laboral';
  }, []);

  return (
    <div className="login-page">
      <section className="login-brand" aria-label="Jornada Laboral">
        <span className="brand">
          <BrandMark />
          Jornada Laboral
        </span>
        <div className="login-pitch">
          <p className="login-headline">Registra tu jornada en segundos</p>
          <p>Entradas y salidas de cada día, horas calculadas al instante y un historial claro para todo el equipo.</p>
          <ul className="login-points">
            <li><FiCheckCircle aria-hidden="true" /> Horas trabajadas calculadas por el servidor</li>
            <li><FiCheckCircle aria-hidden="true" /> Historial personal de cada empleado</li>
            <li><FiCheckCircle aria-hidden="true" /> Gestión de usuarios y roles para administradores</li>
          </ul>
        </div>
        <p className="login-foot">Datos de demostración ficticios.</p>
      </section>
      <main className="login-panel">
        <LoginForm />
      </main>
    </div>
  );
}
