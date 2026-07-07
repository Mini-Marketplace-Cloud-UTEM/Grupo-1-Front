import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../adapters/hooks/useFavorites.jsx';
import { useCart } from '../adapters/hooks/useCart.jsx';

export default function Favorites({ onGoToCatalog }) {
  const { favorites, removeFavorite } = useFavorites();
  const { addToCart, cartState } = useCart();

  const fmt = (n) => '$' + n.toLocaleString('es-CL');

  if (favorites.length === 0) {
    return (
      <div className="page" id="page-favorites">
        <div className="cart-empty" id="favorites-empty-state" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <i className="ti ti-heart-off" aria-hidden="true" style={{ fontSize: '48px', marginBottom: '16px', display: 'block', color: 'var(--color-text-secondary)' }}></i>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#FFF' }}>Tu lista de favoritos está vacía</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '20px', fontSize: '14px' }}>Marca productos como favoritos en la tienda para verlos aquí más tarde.</p>
          <button className="btn btn-primary" onClick={onGoToCatalog}>
            Explorar catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page" id="page-favorites" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#FFF' }}>Mis Favoritos</h2>
        <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          {favorites.length} {favorites.length === 1 ? 'producto' : 'productos'} guardado(s)
        </span>
      </div>

      <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
        {favorites.map((p) => {
          const inCart = cartState[p.id]?.qty || 0;
          return (
            <div key={p.id} className="product-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', background: 'var(--color-background-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
              <div style={{ position: 'relative' }}>
                <Link to={`/productos/${p.id}`} className="product-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', background: '#0B0F0E', overflow: 'hidden' }}>
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const placeholder = e.currentTarget.nextSibling;
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="product-img-placeholder" style={{ display: p.imageUrl ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>
                    📦
                  </div>
                </Link>
                <button
                  onClick={() => removeFavorite(p.id)}
                  title="Eliminar de favoritos"
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(11, 15, 14, 0.7)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#28C064',
                    transition: 'all 0.2s'
                  }}
                >
                  <i className="ti ti-heart-filled" style={{ fontSize: '18px' }}></i>
                </button>
              </div>

              <div className="product-info" style={{ padding: '16px', flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <p className="product-cat" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-primary)', fontWeight: '600', marginBottom: '4px' }}>
                    {p.category}
                  </p>
                  <Link
                    to={`/productos/${p.id}`}
                    className="product-name"
                    title={p.name}
                    style={{ textDecoration: 'none', color: '#FFF', fontWeight: '600', fontSize: '14px', lineClamp: '2', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '38px', marginBottom: '8px' }}
                  >
                    {p.name}
                  </Link>
                  <p className="product-price" style={{ fontSize: '16px', fontWeight: '700', color: '#FFF', margin: '8px 0' }}>
                    {fmt(p.price)}
                  </p>
                  <div style={{ marginBottom: '12px' }}>
                    {p.inStock ? (
                      <span className="stock-badge stock-ok" style={{ fontSize: '12px', color: '#28C064', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <i className="ti ti-circle-check"></i> Disponible
                      </span>
                    ) : (
                      <span className="stock-badge stock-out" style={{ fontSize: '12px', color: '#EF4444', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <i className="ti ti-circle-x"></i> Sin stock
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {!p.inStock ? (
                    <button className="btn btn-sm btn-disabled" style={{ width: '100%' }} disabled>
                      Sin stock
                    </button>
                  ) : (
                    <button
                      className="btn btn-sm btn-primary"
                      style={{ width: '100%' }}
                      onClick={() => addToCart(p, 1)}
                    >
                      {inCart > 0 ? (
                        <>
                          <i className="ti ti-shopping-cart-check"></i> En carrito ({inCart})
                        </>
                      ) : (
                        <>
                          <i className="ti ti-shopping-cart-plus"></i> Comprar
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
