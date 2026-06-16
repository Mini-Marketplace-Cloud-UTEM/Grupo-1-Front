import React from 'react';
import { PRODUCTS, PAGE_SIZE } from '../data/products';

export default function Catalog({
  search,
  category,
  onCategoryChange,
  cart,
  onAddToCart,
  page,
  onPageChange
}) {
  // Format price utility
  const fmt = (n) => '$' + n.toLocaleString('es-CL');

  // Filter products
  const filtered = PRODUCTS.filter((p) => {
    const catOk = category === 'all' || p.cat === category;
    const searchOk =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.cat.toLowerCase().includes(search.toLowerCase());
    return catOk && searchOk;
  });

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  
  // Safe page guard
  const currentPage = page > pages ? 1 : page;
  const slice = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="page" id="page-catalog">
      <div className="catalog-toolbar">
        <div className="filter-chips">
          {['all', 'Electrónica', 'Hogar', 'Oficina'].map((catName) => (
            <div
              key={catName}
              className={`chip ${category === catName ? 'active' : ''}`}
              onClick={() => onCategoryChange(catName)}
            >
              {catName === 'all' ? 'Todos' : catName}
            </div>
          ))}
        </div>
        <span id="result-count">
          {total} producto{total !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="product-grid" id="product-grid">
        {slice.map((p) => {
          const inCart = cart[p.id]?.qty || 0;
          
          let stockBadge;
          if (p.stock === 0) {
            stockBadge = <span className="stock-badge stock-out">Sin stock</span>;
          } else if (p.stock <= 3) {
            stockBadge = <span className="stock-badge stock-low">Últimas {p.stock}</span>;
          } else {
            stockBadge = <span className="stock-badge stock-ok">Disponible</span>;
          }

          let addBtn;
          if (p.stock === 0) {
            addBtn = (
              <button className="btn btn-sm" style={{ width: '100%', opacity: 0.5 }} disabled>
                Sin stock
              </button>
            );
          } else if (inCart > 0) {
            addBtn = (
              <button className="btn btn-sm btn-primary" style={{ width: '100%' }} onClick={() => onAddToCart(p.id)}>
                <i className="ti ti-circle-check" aria-hidden="true" style={{ marginRight: '4px' }}></i> En carrito ({inCart})
              </button>
            );
          } else {
            addBtn = (
              <button className="btn btn-sm btn-primary" style={{ width: '100%' }} onClick={() => onAddToCart(p.id)}>
                Agregar
              </button>
            );
          }

          return (
            <div key={p.id} className="product-card">
              <div className="product-img" style={{ background: 'var(--color-background-secondary)' }}>
                {p.icon}
              </div>
              <p className="product-name">{p.name}</p>
              <p className="product-cat">{p.cat}</p>
              <p className="product-price">{fmt(p.price)}</p>
              {stockBadge}
              <div style={{ marginTop: '8px' }}>{addBtn}</div>
            </div>
          );
        })}
      </div>

      {pages > 1 && (
        <div className="pagination" id="pagination">
          {currentPage > 1 && (
            <div className="page-btn" onClick={() => onPageChange(currentPage - 1)}>
              <i className="ti ti-chevron-left" aria-hidden="true"></i>
            </div>
          )}
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <div
              key={n}
              className={`page-btn ${n === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange(n)}
            >
              {n}
            </div>
          ))}
          {currentPage < pages && (
            <div className="page-btn" onClick={() => onPageChange(currentPage + 1)}>
              <i className="ti ti-chevron-right" aria-hidden="true"></i>
            </div>
          )}
          <span className="page-info">
            Página {currentPage} de {pages}
          </span>
        </div>
      )}
    </div>
  );
}
