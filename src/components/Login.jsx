import React, { useState } from 'react';

export default function Login({ onLogin, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (submitting) return;
    setErrorMsg('');
    setSubmitting(true);
    try {
      const loggedUser = await onLogin(email, password);
      onLoginSuccess(loggedUser.name, loggedUser.token);
    } catch (err) {
      setErrorMsg(err.message || 'Error al iniciar sesión.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h2>Iniciar sesión</h2>
        <p>Accede para explorar el catálogo y gestionar tus pedidos.</p>

        {errorMsg && (
          <div className="error-msg" id="login-error">
            <i className="ti ti-alert-circle" aria-hidden="true"></i>
            <span id="login-error-text">{errorMsg}</span>
          </div>
        )}

        <div className="form-group">
          <label>Correo electrónico</label>
          <input
            type="email"
            id="login-email"
            placeholder="usuario@correo.cl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Contraseña</label>
          <input
            type="password"
            id="login-pass"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleLogin();
            }}
          />
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '4px' }}
          onClick={handleLogin}
          disabled={submitting}
        >
          {submitting ? 'Ingresando…' : 'Ingresar'}
        </button>
      </div>
    </div>
  );
}
