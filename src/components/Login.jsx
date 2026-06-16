import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('demo@minimarket.cl');
  const [password, setPassword] = useState('demo1234');
  const [errorMsg, setErrorMsg] = useState('');
  const [tokenDisplay, setTokenDisplay] = useState('');

  const handleLogin = () => {
    if (email === 'demo@minimarket.cl' && password === 'demo1234') {
      setErrorMsg('');
      const mockToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkZW1vQG1pbmltYXJrZXQuY2wiLCJleHAiOjE3NTEwMDAwMDB9.demo_jwt_token';
      setTokenDisplay(`JWT: ${mockToken.slice(0, 40)}...`);
      setTimeout(() => {
        onLoginSuccess('Demo Usuario', mockToken);
      }, 900);
    } else {
      setErrorMsg('Credenciales incorrectas.');
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
