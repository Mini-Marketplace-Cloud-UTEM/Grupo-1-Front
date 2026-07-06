import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../adapters/hooks/useAuth.jsx';

// Registro de cuenta nueva. Crea el usuario en G2 (vía BFF) y, como G2
// devuelve el token al registrar, deja la sesión iniciada y va a la tienda.
export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (submitting) return;
    setErrorMsg('');

    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg('Completa todos los campos.');
      return;
    }
    if (password !== confirm) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/tienda');
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo crear la cuenta.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h2>Crear cuenta</h2>
        <p>Regístrate para comprar y gestionar tus pedidos.</p>

        {errorMsg && (
          <div className="error-msg" id="register-error">
            <i className="ti ti-alert-circle" aria-hidden="true"></i>
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Correo electrónico</label>
          <input
            type="email"
            placeholder="usuario@correo.cl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Repetir contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRegister();
            }}
          />
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '4px' }}
          onClick={handleRegister}
          disabled={submitting}
        >
          {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>

        <p style={{ marginTop: '12px', fontSize: '13px', textAlign: 'center' }}>
          ¿Ya tienes cuenta? <Link to="/login" className="f_detail_price_accent">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
