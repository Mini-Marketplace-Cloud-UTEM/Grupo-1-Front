import React from 'react';

// Esqueleto del dashboard de Admin. Ruta separada (/admin/dashboard),
// sin link visible desde la tienda principal.
// TODO: conectar cada seccion contra el BFF (/v1/admin/reports/*) una vez
// que exista un login de admin real con rol "admin" (ver gap documentado
// en scratch/analisis-interacciones-por-funcionalidad). Por ahora son
// placeholders sin datos, solo para tener la estructura de la pagina.
const REPORT_SECTIONS = [
  { title: 'Resumen de ventas', endpoint: '/v1/admin/reports/sales' },
  { title: 'Pedidos por estado', endpoint: '/v1/admin/reports/orders-by-status' },
  { title: 'Productos más vendidos', endpoint: '/v1/admin/reports/top-products' },
  { title: 'Ticket promedio', endpoint: '/v1/admin/reports/average-ticket' },
  { title: 'Horas de mayor demanda', endpoint: '/v1/admin/reports/peak-hours' },
  { title: 'Rendimiento de despacho', endpoint: '/v1/admin/reports/delivery-performance' }
];

export default function AdminDashboard() {
  return (
    <div className="page" style={{ padding: '24px' }}>
      <h1>Panel de Administración</h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        Esqueleto — pendiente de conectar a los datos reales.
      </p>

      <div className="product-grid" style={{ marginTop: '24px' }}>
        {REPORT_SECTIONS.map((section) => (
          <div key={section.endpoint} className="product-card">
            <h3>{section.title}</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>
              {section.endpoint}
            </p>
            <p>Sin datos todavía.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
