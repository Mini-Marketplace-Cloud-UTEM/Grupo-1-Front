import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

// Esqueleto de la Landing Page publica (sin login). Pendiente: traer
// ofertas/destacados reales desde el BFF (GET /v1/products con algun
// filtro de "destacado" cuando exista), banners promocionales, etc.
// Por ahora solo la estructura y la navegacion.
export default function LandingPage() {
  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-logo">
          <i className="ti ti-shopping-bag" aria-hidden="true"></i> MiniMarketPlace
        </div>
        <div className="nav-actions">
          <Link className="btn btn-sm" to="/login">
            Iniciar sesión
          </Link>
        </div>
      </nav>

      <main style={{ flex: 1, padding: '40px 24px' }}>
        {/* TODO: hero/banner promocional real */}
        <section style={{ textAlign: 'center', padding: '60px 0' }}>
          <h1>Bienvenido a MiniMarketPlace</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '12px 0 24px' }}>
            Encuentra ofertas, productos destacados y todo lo que necesitas.
          </p>
          <Link className="btn btn-primary" to="/login">
            Ver catálogo completo
          </Link>
        </section>

        {/* TODO: seccion de ofertas/destacados (placeholder) */}
        <section style={{ marginTop: '40px' }}>
          <h2>Ofertas destacadas</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Próximamente — sección pendiente de desarrollo.
          </p>
        </section>

        {/* TODO: vista previa del catalogo (placeholder) */}
        <section style={{ marginTop: '40px' }}>
          <h2>Catálogo</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Próximamente — vista previa del catálogo sin necesidad de iniciar sesión.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
