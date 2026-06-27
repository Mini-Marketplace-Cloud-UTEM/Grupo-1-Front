import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Esqueleto de login de Admin. Ruta separada (/admin/login), sin link
// visible desde la tienda principal - solo accesible escribiendo la URL.
// TODO: conectar contra /v1/auth/login real y verificar rol "admin"
// (hoy el mock de Grupo 2 nunca devuelve ese rol, ver notas internas).
export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: reemplazar por login real + chequeo de rol admin.
    setError('Login de admin todavía no implementado.');
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
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
