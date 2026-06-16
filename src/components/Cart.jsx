import React from 'react';

export default function Cart({
  cart,
  onQtyChange,
  onRemoveItem,
  onClearCart,
  onPlaceOrder,
  orderSuccessToken,
  onGoToCatalog
}) {
  const fmt = (n) => '$' + n.toLocaleString('es-CL');
  const items = Object.values(cart).filter((x) => x.qty > 0);

  if (items.length === 0) {
    return (
      <div className="page" id="page-cart">
        <div className="cart-empty" id="cart-empty-state">
          <i className="ti ti-shopping-cart" aria-hidden="true" style={{ fontSize: '36px', marginBottom: '10px', display: 'block', color: 'var(--color-text-secondary)' }}></i>
          <p>Tu carrito está vacío</p>
          <button className="btn" onClick={onGoToCatalog}>
            Ver catálogo
          </button>
        </div>
      </div>
    );
  }

  const total = items.reduce((acc, item) => acc + item.product.price * item.qty, 0);

  return (
    <div className="page" id="page-cart">
      <div id="cart-full">
        <div className="cart-layout">
          <div className="cart-items">
            <div className="cart-header">
              <h3>Productos seleccionados</h3>
              <button className="btn btn-sm" onClick={onClearCart}>
                Vaciar
              </button>
            </div>
            <div id="cart-items-list">
              {items.map(({ product: p, qty }) => {
                const sub = p.price * qty;
                return (
                  <div key={p.id} className="cart-item">
                    <div className="ci-icon" style={{ background: 'var(--color-background-secondary)' }}>
                      {p.icon}
                    </div>
                    <div className="ci-info">
                      <p>{p.name}</p>
                      <span>{fmt(p.price)} c/u</span>
                    </div>
                    <div className="qty-ctrl">
                      <div className="qty-btn" onClick={() => onQtyChange(p.id, -1)}>
                        −
                      </div>
                      <span className="qty-num">{qty}</span>
                      <div className="qty-btn" onClick={() => onQtyChange(p.id, 1)}>
                        +
                      </div>
                    </div>
                    <span className="ci-total">{fmt(sub)}</span>
                    <i
                      className="ti ti-x ci-remove"
                      onClick={() => onRemoveItem(p.id)}
                      aria-label="Eliminar"
                    ></i>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <div className="order-summary" id="order-summary">
              <h3>Resumen del pedido</h3>
              <div id="summary-lines">
                {items.map(({ product: p, qty }) => (
                  <div key={p.id} className="summary-row">
                    <span>
                      {p.name} ×{qty}
                    </span>
                    <span>{fmt(p.price * qty)}</span>
                  </div>
                ))}
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span id="cart-total">{fmt(total)}</span>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '14px' }} onClick={onPlaceOrder}>
                Generar pedido
              </button>
              
              {orderSuccessToken && (
                <div id="order-success" style={{
                  marginTop: '10px',
                  padding: '8px 10px',
                  background: 'var(--color-background-success)',
                  border: '0.5px solid var(--color-border-success)',
                  borderRadius: 'var(--border-radius-md)',
                  fontSize: '12px',
                  color: 'var(--color-text-success)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <i className="ti ti-circle-check" aria-hidden="true"></i>
                  <span>
                    ¡Pedido generado! Token: <strong id="order-token-txt">{orderSuccessToken}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
