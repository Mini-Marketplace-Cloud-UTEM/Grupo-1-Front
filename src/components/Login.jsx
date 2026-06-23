import React, { useState } from 'react';

export default function Login({ onLogin, onLoginSuccess }) {
  const [email, setEmail] = useState('demo@minimarket.cl');
  const [password, setPassword] = useState('demo1234');
  const [errorMsg, setErrorMsg] = useState('');
  const [tokenDisplay, setTokenDisplay] = useState('');

  const handleLogin = async () => {
    setErrorMsg('');
    setTokenDisplay('');
    try {
      const loggedUser = await onLogin(email, password);
      setTokenDisplay(`JWT: ${loggedUser.token.slice(0, 40)}...`);
      setTimeout(() => {
        onLoginSuccess(loggedUser.name, loggedUser.token);
      }, 900);
    } catch (err) {
      setErrorMsg(err.message || 'Error al iniciar sesión.');
      setTokenDisplay('');
    }
  };

  const handleSimulateFail = () => {
    setErrorMsg('Error 401 — No autorizado. Verifica tus credenciales.');
    setTokenDisplay('');
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
            placeholder="usuario@empresa.cl"
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

        <button className="btn btn-primary" style={{ width: '100%', marginTop: '4px' }} onClick={handleLogin}>
          Ingresar
        </button>
        <button className="btn" style={{ width: '100%', marginTop: '8px', fontSize: '12px' }} onClick={handleSimulateFail}>
          Simular error 401
        </button>

        {tokenDisplay && (
          <div className="token-pill" id="token-display">
            {tokenDisplay}
          </div>
        )}
      </div>
    </div>
  );
}
