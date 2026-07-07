import React from 'react';

export default function Navbar({
  user,
  cartCount,
  onTabChange,
  onLogout,
  onLogin,
  search,
  onSearchChange,
  isLoggedIn
}) {
  return (
    <nav className="nav">
      <div
        className="nav-logo"
        onClick={() => onTabChange('catalog')}
        style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <i className="ti ti-shopping-bag" aria-hidden="true" style={{ color: 'var(--color-primary)', fontSize: '18px' }}></i>
        <span style={{ fontWeight: '800', fontSize: '16px', letterSpacing: '-0.5px' }}>
          Mini<span style={{ color: 'var(--color-primary)' }}>MarketPlace</span>
        </span>
      </div>
      {/* Buscador visible siempre: un invitado tambien puede buscar en el catalogo. */}
      <div className="nav-search" id="nav-search-wrap">
        <i className="ti ti-search" aria-hidden="true"></i>
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="nav-actions">
        {/* El carrito existe con o sin sesion (el invitado tambien arma su carro). */}
        <button className="btn btn-ghost cart-btn" onClick={() => onTabChange('cart')}>
          <i className="ti ti-shopping-cart" aria-hidden="true"></i>
          <span className="cart-count">{cartCount}</span>
        </button>
        {isLoggedIn ? (
          <>
            <span id="user-label" style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              {user}
            </span>
            <button className="btn btn-sm" onClick={onLogout}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <button className="btn btn-sm btn-primary" onClick={onLogin}>
            Iniciar sesión
          </button>
        )}
      </div>
    </nav>
  );
}
