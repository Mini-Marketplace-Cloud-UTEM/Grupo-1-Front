import React from 'react';

export default function Navbar({
  user,
  cartCount,
  onTabChange,
  onLogout,
  search,
  onSearchChange,
  isLoggedIn
}) {
  return (
    <nav className="nav">
      <div className="nav-logo">
        <i className="ti ti-shopping-bag" aria-hidden="true"></i> MiniMarket
      </div>
      {isLoggedIn && (
        <div className="nav-search" id="nav-search-wrap">
          <i className="ti ti-search" aria-hidden="true"></i>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}
      <div className="nav-actions">
        {isLoggedIn && (
          <>
            <span id="user-label" style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              {user}
            </span>
            <button className="btn btn-ghost cart-btn" onClick={() => onTabChange('cart')}>
              <i className="ti ti-shopping-cart" aria-hidden="true"></i>
              <span className="cart-count">{cartCount}</span>
            </button>
            <button className="btn btn-sm" onClick={onLogout}>
              Cerrar sesión
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
