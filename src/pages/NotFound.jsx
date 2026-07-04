import React from 'react';
import { Link } from 'react-router-dom';

// Pagina 404 propia. Antes la ruta comodin "*" redirigia en silencio a "/",
// lo que ocultaba errores de navegacion. Ahora mostramos un 404 claro con
// una salida hacia el inicio.
export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        background: '#121212',
        color: '#fff',
      }}
    >
      <div
        style={{
          fontSize: 'clamp(72px, 18vw, 140px)',
          fontWeight: 800,
          lineHeight: 1,
          color: '#28C064',
          letterSpacing: '-0.04em',
        }}
      >
        404
      </div>
      <h1 style={{ marginTop: '0.5rem', fontSize: '1.5rem', fontWeight: 700 }}>
        Página no encontrada
      </h1>
      <p style={{ marginTop: '0.75rem', maxWidth: '28rem', color: '#a1a1aa' }}>
        La dirección que ingresaste no existe o el contenido se movió. Revisa el enlace
        o vuelve al inicio para seguir navegando.
      </p>
      <Link
        to="/"
        style={{
          marginTop: '1.75rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: '#28C064',
          color: '#08130c',
          fontWeight: 700,
          padding: '0.7rem 1.4rem',
          borderRadius: '0.75rem',
          textDecoration: 'none',
        }}
      >
        Volver al inicio
      </Link>
    </div>
  );
}
