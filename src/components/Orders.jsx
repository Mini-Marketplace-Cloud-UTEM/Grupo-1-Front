import React from 'react';

const statusSteps = ['Recibido', 'En proceso', 'Despachado', 'Entregado'];
const statusMap = { pending: 0, processing: 1, shipped: 2, delivered: 3, cancelled: -1 };
const statusLabels = {
  pending: 'Pendiente',
  processing: 'En proceso',
  shipped: 'Despachado',
  delivered: 'Entregado',
  cancelled: 'Cancelado'
};

export default function Orders({ orders, error }) {
  const fmt = (n) => '$' + n.toLocaleString('es-CL');

  return (
    <div className="page" id="page-orders">
      {error && (
        <div className="error-banner" id="orders-error">
          <i className="ti ti-alert-triangle" aria-hidden="true"></i>
          <p>No se pudo conectar con el servicio de pedidos. Reintentando...</p>
        </div>
      )}

      <div className="order-list" id="orders-list">
        {orders.length === 0 ? (
          <div className="cart-empty">
            <i className="ti ti-receipt" aria-hidden="true" style={{ fontSize: '36px', marginBottom: '10px', display: 'block', color: 'var(--color-text-secondary)' }}></i>
            <p>Sin pedidos aún</p>
          </div>
        ) : (
          orders.map((o) => {
            const si = statusMap[o.status] ?? 0;
            const statusLabel = statusLabels[o.status] || o.status;
            const statusCls = `s-${o.status}`;

            return (
              <div key={o.id} className="order-card">
                <div className="order-top">
                  <span className="order-id">
                    <i className="ti ti-receipt" aria-hidden="true" style={{ marginRight: '4px' }}></i>
                    {o.id}
                  </span>
                  <span className={`status-badge ${statusCls}`}>{statusLabel}</span>
                  <span className="order-date">{o.date}</span>
                </div>

                <div className="order-progress">
                  {statusSteps.map((s, i) => {
                    const done = i <= si && o.status !== 'cancelled';
                    const active = i === si && o.status !== 'cancelled';
                    const icon = done ? <i className="ti ti-check" aria-hidden="true"></i> : i + 1;
                    return (
                      <div key={s} className="progress-step">
                        <div className={`step-dot ${done ? 'done' : active ? 'active' : ''}`}>
                          {icon}
                        </div>
                        <div className="step-label">{s}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="order-items-row">
                  {o.items.map((item, idx) => (
                    <span key={idx} className="order-item-chip">
                      {item.name} ×{item.qty}
                    </span>
                  ))}
                </div>

                <div className="order-footer">
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {o.items.length} producto{o.items.length !== 1 ? 's' : ''}
                  </span>
                  <span className="order-total">{fmt(o.total)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
