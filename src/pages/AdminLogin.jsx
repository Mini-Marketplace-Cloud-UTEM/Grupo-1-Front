import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../adapters/hooks/useAuth.jsx';

// Login de Admin. Ruta separada (/admin/login), sin link visible desde la
// tienda principal - solo accesible escribiendo la URL. Usa el mismo login()
// del AuthProvider (misma sesion que la tienda) pero exige que el JWT traiga
// el rol admin; si no lo trae, se cierra la sesion recien abierta para no
// dejar a un customer "colado" con sesion iniciada desde esta pantalla.
export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout, isLoggedIn, isAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Si ya hay sesion admin (p.ej. F5 o volver atras), directo al panel.
  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isLoggedIn, isAdmin, navigate]);

  // El dashboard deja esta marca cuando una llamada admin devolvio 401
  // (token vencido; G2 no ofrece refresh confiable todavia). Se consume
  // una sola vez. location.state queda como canal secundario.
  useEffect(() => {
    let expired = location.state?.expired || false;
    try {
      if (sessionStorage.getItem('adminSessionExpired')) {
        expired = true;
        sessionStorage.removeItem('adminSessionExpired');
      }
    } catch { /* sin storage no hay marca que leer */ }
    if (expired) {
      setError('Tu sesión expiró. Vuelve a iniciar sesión.');
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const logged = await login(email, password);
      if (!logged.roles?.includes('admin')) {
        logout();
        setError('Esta cuenta no tiene permisos de administrador.');
        return;
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h2>Panel de Administración</h2>
        <p>Acceso restringido — solo personal autorizado.</p>

        {error && (
          <div className="error-msg">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            className="btn btn-primary"
            type="submit"
            style={{ width: '100%' }}
            disabled={submitting}
          >
            {submitting ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
