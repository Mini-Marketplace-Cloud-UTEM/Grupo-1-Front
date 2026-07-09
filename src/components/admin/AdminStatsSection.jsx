import React, { useEffect, useState } from 'react';
import {
  fetchAverageTicket,
  fetchDeliveryPerformance,
  fetchOrdersByStatus,
  fetchPeakHours,
  fetchSalesReport,
  fetchTopProducts,
} from '../../api.js';

const formatCLP = (n) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(n ?? 0);

const formatNum = (n) => new Intl.NumberFormat('es-CL').format(n ?? 0);

const REPORTS = [
  ['sales', fetchSalesReport],
  ['ordersByStatus', fetchOrdersByStatus],
  ['topProducts', fetchTopProducts],
  ['averageTicket', fetchAverageTicket],
  ['peakHours', fetchPeakHours],
  ['delivery', fetchDeliveryPerformance],
];

// Seccion Estadisticas: los 6 reportes de G7 via BFF. Cada card carga y
// falla por separado (Promise.allSettled): un reporte caido no tumba el
// resto. Visualizaciones sin librerias: tiles + barras CSS de una sola
// serie (hue validado contra la superficie oscura, valores etiquetados
// directo — no hace falta leyenda con una serie unica).
export default function AdminStatsSection({ onAuthError }) {
  // name -> {status: 'loading'|'ok'|'error', data?, message?}. Arranca ya
  // en loading: el primer render ocurre antes del useEffect y las cards no
  // pueden asumir que su reporte exista.
  const initialLoading = () =>
    Object.fromEntries(REPORTS.map(([name]) => [name, { status: 'loading' }]));
  const [reports, setReports] = useState(initialLoading);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setReports(initialLoading());

    Promise.allSettled(REPORTS.map(([, fn]) => fn())).then((results) => {
      if (cancelled) return;
      const next = {};
      results.forEach((r, i) => {
        const name = REPORTS[i][0];
        if (r.status === 'fulfilled') {
          next[name] = { status: 'ok', data: r.value };
        } else {
          if (onAuthError?.(r.reason)) return;
          next[name] = { status: 'error', message: r.reason?.message };
        }
      });
      setReports(next);
    });

    return () => {
      cancelled = true;
    };
  }, [reloadKey, onAuthError]);

  const tile = (label, report, render, sub) => (
    <div className="admin-stat-tile">
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-value">
        {report?.status === 'ok' ? render(report.data) : report?.status === 'error' ? '—' : '…'}
      </div>
      {report?.status === 'ok' && sub && <div className="admin-stat-sub">{sub(report.data)}</div>}
      {report?.status === 'error' && <div className="admin-stat-sub">No disponible</div>}
    </div>
  );

  const chartCard = (title, report, renderData, isEmpty) => (
    <div className="admin-chart-card">
      <h3>{title}</h3>
      {report?.status === 'error' ? (
        <div className="admin-chart-error">No disponible ({report.message || 'error'}).</div>
      ) : report?.status !== 'ok' ? (
        <div className="admin-chart-error">Cargando…</div>
      ) : isEmpty(report.data) ? (
        <div className="admin-chart-error">Sin datos todavía.</div>
      ) : (
        renderData(report.data)
      )}
    </div>
  );

  const statusRows = (data) => {
    const rows = data || [];
    const max = Math.max(...rows.map((r) => r.count), 1);
    return rows.map((r) => (
      <div className="admin-bar-row" key={r.status}>
        <span className="admin-bar-label">{r.status}</span>
        <div className="admin-bar-track">
          <div className="admin-bar-fill" style={{ width: `${(r.count / max) * 100}%` }} />
        </div>
        <span className="admin-bar-value">{formatNum(r.count)}</span>
      </div>
    ));
  };

  const hourColumns = (data) => {
    // Rejilla completa 0-23: las horas sin pedidos se dibujan igual (en 0)
    // para que la forma del dia sea comparable de un vistazo.
    const byHour = new Map((data || []).map((h) => [h.hour, h.orderCount]));
    const counts = Array.from({ length: 24 }, (_, h) => byHour.get(h) || 0);
    const max = Math.max(...counts, 1);
    return (
      <>
        <div className="admin-hours">
          {counts.map((count, h) => (
            <div className="admin-hour-col" key={h} title={`${h}:00 — ${formatNum(count)} pedidos`}>
              <div
                className="admin-hour-fill"
                style={{ height: `${(count / max) * 100}%`, opacity: count === 0 ? 0.25 : 1 }}
              />
            </div>
          ))}
        </div>
        <div className="admin-hours-axis">
          <span>0h</span>
          <span>6h</span>
          <span>12h</span>
          <span>18h</span>
          <span>23h</span>
        </div>
      </>
    );
  };

  const topProductsTable = (data) => (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Producto</th>
          <th style={{ textAlign: 'right' }}>Unidades</th>
          <th style={{ textAlign: 'right' }}>Ingresos</th>
        </tr>
      </thead>
      <tbody>
        {(data.data || []).map((p) => (
          <tr key={p.productId}>
            <td>{p.name}</td>
            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              {formatNum(p.unitsSold)}
            </td>
            <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              {formatCLP(p.revenue)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="admin-section">
      <div className="admin-section-head">
        <h2>Estadísticas</h2>
        <button className="btn btn-sm" onClick={() => setReloadKey((k) => k + 1)}>
          Actualizar
        </button>
      </div>

      <div className="admin-stats-grid">
        {tile('Ventas totales', reports.sales, (d) => formatCLP(d.totalSales))}
        {tile('Pedidos totales', reports.sales, (d) => formatNum(d.totalOrders))}
        {tile('Ticket promedio', reports.averageTicket, (d) => formatCLP(d.averageTicket))}
        {tile(
          'Tiempo promedio de entrega',
          reports.delivery,
          (d) => `${formatNum(d.avgDeliveryTimeMinutes)} min`,
          (d) => `${formatNum(d.totalDeliveredCount)} pedidos entregados`
        )}
      </div>

      <div className="admin-charts-grid">
        {chartCard(
          'Pedidos por estado',
          reports.ordersByStatus,
          statusRows,
          (d) => !d || d.length === 0
        )}
        {chartCard(
          'Horas de mayor demanda',
          reports.peakHours,
          hourColumns,
          (d) => !d || d.length === 0
        )}
        {chartCard(
          'Productos más vendidos',
          reports.topProducts,
          topProductsTable,
          (d) => !d?.data || d.data.length === 0
        )}
      </div>
    </div>
  );
}
