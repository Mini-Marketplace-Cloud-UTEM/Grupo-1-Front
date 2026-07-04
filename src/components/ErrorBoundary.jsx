import React from 'react';

// Red de seguridad global. Si cualquier componente lanza un error durante el
// render, sin esto React desmonta TODO el arbol y el usuario ve una pantalla
// en blanco. El ErrorBoundary atrapa ese error y muestra un fallback amable,
// dejando el resto de la app recuperable con "Recargar".
//
// Tiene que ser un componente de clase: hoy no existe un equivalente con hooks
// para getDerivedStateFromError / componentDidCatch.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Log para depurar; en produccion aca podria ir un reporte a un servicio.
    console.error('ErrorBoundary atrapó un error de render:', error, info);
  }

  handleReload = () => {
    window.location.assign('/');
  };

  render() {
    if (!this.state.hasError) return this.props.children;

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
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Algo salió mal</h1>
        <p style={{ marginTop: '0.75rem', maxWidth: '28rem', color: '#a1a1aa' }}>
          Ocurrió un error inesperado en la aplicación. Puedes recargar para volver a
          intentarlo; el resto del sitio sigue disponible.
        </p>
        <button
          onClick={this.handleReload}
          style={{
            marginTop: '1.75rem',
            background: '#28C064',
            color: '#08130c',
            fontWeight: 700,
            padding: '0.7rem 1.4rem',
            borderRadius: '0.75rem',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Recargar la página
        </button>
      </div>
    );
  }
}
