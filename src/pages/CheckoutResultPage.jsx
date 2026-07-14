import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

// Pantallas de retorno de MercadoPago (back_urls definidas por G4/G8, 2026-07-14):
//   /success  -> pago aceptado (+ resumen)
//   /failure  -> pago rechazado (+ reintentar)
//   /pending  -> pago en proceso
// Se cargan como recarga COMPLETA desde MercadoPago; la sesión se rehidrata de
// localStorage (useAuth), y el resumen del pedido lo dejó `placeOrder` en
// localStorage('lastCheckout') antes de redirigir. NO exigen sesión (son landing
// de un redirect externo).
const CONFIG = {
  success: {
    icon: 'ti-circle-check',
    color: 'var(--color-text-success)',
    bg: 'var(--color-background-success)',
    border: 'var(--color-border-success)',
    title: '¡Pago Aceptado!',
    desc: 'Tu pago fue aprobado y tu pedido quedó registrado. Puedes seguir su estado en "Mis pedidos".',
  },
  failure: {
    icon: 'ti-circle-x',
    color: '#f87171',
    bg: 'rgba(220, 38, 38, 0.1)',
    border: 'rgba(220, 38, 38, 0.3)',
    title: 'Pago Rechazado',
    desc: 'No pudimos procesar tu pago. No se realizó ningún cobro; puedes intentarlo nuevamente.',
  },
  pending: {
    icon: 'ti-clock',
    color: '#fbbf24',
    bg: 'rgba(217, 119, 6, 0.1)',
    border: 'rgba(217, 119, 6, 0.3)',
    title: 'Pago en proceso',
    desc: 'Tu pago está siendo procesado. Te avisaremos cuando se confirme; también puedes revisarlo en "Mis pedidos".',
  },
};

const fmt = (n) => '$' + Number(n || 0).toLocaleString('es-CL');

export default function CheckoutResultPage({ status = 'pending' }) {
  const navigate = useNavigate();
  const cfg = CONFIG[status] || CONFIG.pending;

  // Resumen del intento, guardado por placeOrder antes de redirigir al pago.
  const order = useMemo(() => {
    try {
      const raw = localStorage.getItem('lastCheckout');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // Cerrado el intento (éxito o fallo), soltamos el resumen para que no
  // reaparezca en una compra futura. En "pending" lo dejamos por si recargan.
  useEffect(() => {
    if (status === 'success' || status === 'failure') {
      try {
        localStorage.removeItem('lastCheckout');
      } catch {
        /* almacenamiento no disponible: no pasa nada */
      }
    }
  }, [status]);

  return (
    <div className="app">
      <header className="nav" style={{ padding: '0 40px', height: '60px' }}>
        <div className="nav-logo" onClick={() => navigate('/tienda')} style={{ cursor: 'pointer' }}>
          <i className="ti ti-shopping-cart-check" style={{ fontSize: '20px' }}></i>
          <span style={{ fontWeight: 600, letterSpacing: '0.5px' }}>MARKETPLACE CLOUD</span>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '48px 20px' }}>
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-primary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              color: cfg.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
            }}
          >
            <i className={`ti ${cfg.icon}`} style={{ fontSize: '34px' }}></i>
          </div>

          <h1 style={{ fontSize: '20px', fontWeight: 700, color: cfg.color, marginBottom: '8px' }}>{cfg.title}</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '24px', lineHeight: 1.5 }}>
            {cfg.desc}
          </p>

          {status !== 'failure' && order && (
            <div
              style={{
                textAlign: 'left',
                background: 'var(--color-background-secondary)',
                border: '0.5px solid var(--color-border-primary)',
                borderRadius: 'var(--border-radius-md)',
                padding: '16px',
                marginBottom: '24px',
                fontSize: '13px',
              }}
            >
              {order.orderId && (
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}>N° de pedido</span>
                  <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{order.orderId}</p>
                </div>
              )}
              {(order.items || []).map((it, i) => (
                <div
                  key={i}
                  style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', marginBottom: '4px' }}
                >
                  <span className="truncate-2-lines" style={{ paddingRight: 12 }}>{it.name} ×{it.qty}</span>
                  <span style={{ whiteSpace: 'nowrap' }}>{fmt(it.price * it.qty)}</span>
                </div>
              ))}
              {order.totalAmount != null && (
                <div
                  style={{
                    borderTop: '0.5px solid var(--color-border-primary)',
                    marginTop: '10px',
                    paddingTop: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 700,
                  }}
                >
                  <span>Total</span>
                  <span style={{ color: 'var(--color-primary)' }}>{fmt(order.totalAmount)}</span>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {status === 'failure' ? (
              <button className="btn btn-primary" style={{ padding: '12px' }} onClick={() => navigate('/tienda')}>
                Reintentar
              </button>
            ) : (
              <button
                className="btn btn-primary"
                style={{ padding: '12px' }}
                onClick={() => navigate('/tienda', { state: { tab: 'orders' } })}
              >
                Ver mis pedidos
              </button>
            )}
            <button className="btn" style={{ padding: '12px' }} onClick={() => navigate('/tienda')}>
              Volver a la tienda
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
