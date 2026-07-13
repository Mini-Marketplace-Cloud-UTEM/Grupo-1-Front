import React, { useEffect, useState } from 'react';
import { adminDeleteProduct, adminFetchInventory, fetchProducts } from '../../api.js';
import AdminProductForm from './AdminProductForm.jsx';

const PAGE_SIZE = 10;

const formatCLP = (n) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(n ?? 0);

// Seccion Items: CRUD de productos (via BFF -> G3) + inventario por fila
// (via BFF -> G4, dato best-effort: si G4 falla no bloquea nada).
export default function AdminItemsSection({ onAuthError }) {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  // null | {mode: 'create'} | {mode: 'edit', product}
  const [form, setForm] = useState(null);
  // productId -> {loading, data, error} (panel de inventario expandido)
  const [inventory, setInventory] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchProducts({ q, page, pageSize: PAGE_SIZE })
      .then((body) => {
        if (cancelled) return;
        // G3 ya excluye los DELETED de su listado; el filtro es solo un
        // cinturon por si eso cambia.
        setProducts((body.data || []).filter((p) => p.status !== 'DELETED'));
        setPagination(body.pagination || null);
      })
      .catch((err) => {
        if (!cancelled && !onAuthError?.(err)) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q, page, reloadKey, onAuthError]);

  const reload = () => setReloadKey((k) => k + 1);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setQ(searchInput.trim());
  };

  const handleDelete = async (product) => {
    const ok = window.confirm(`¿Eliminar "${product.name}" del catálogo?`);
    if (!ok) return;
    setDeletingId(product.id);
    try {
      await adminDeleteProduct(product.id);
      reload();
    } catch (err) {
      if (!onAuthError?.(err)) setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleInventory = async (productId) => {
    if (inventory[productId]) {
      // Segundo click: colapsa el panel.
      setInventory((inv) => {
        const next = { ...inv };
        delete next[productId];
        return next;
      });
      return;
    }
    setInventory((inv) => ({ ...inv, [productId]: { loading: true } }));
    try {
      const data = await adminFetchInventory(productId);
      setInventory((inv) => ({ ...inv, [productId]: { data } }));
    } catch (err) {
      if (onAuthError?.(err)) return;
      setInventory((inv) => ({ ...inv, [productId]: { error: true } }));
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-head">
        <h2>Items del catálogo</h2>
        <div className="admin-toolbar">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
            <input
              className="admin-search"
              placeholder="Buscar producto…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button className="btn btn-sm" type="submit">
              Buscar
            </button>
          </form>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setForm({ mode: 'create' })}
            disabled={!!form}
          >
            + Agregar producto
          </button>
        </div>
      </div>

      {form && (
        <AdminProductForm
          mode={form.mode}
          product={form.product}
          onAuthError={onAuthError}
          onCancel={() => setForm(null)}
          onSaved={() => {
            setForm(null);
            reload();
          }}
        />
      )}

      {error && (
        <div className="error-msg">
          <span>{error}</span>
          <button className="btn btn-sm" onClick={reload} style={{ marginLeft: 8 }}>
            Reintentar
          </button>
        </div>
      )}

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Cargando productos…</div>
        ) : products.length === 0 ? (
          <div className="admin-empty">
            {q ? `Sin resultados para "${q}".` : 'No hay productos en el catálogo.'}
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Categoría</th>
                <th>Tamaño</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <React.Fragment key={p.id}>
                  <tr>
                    <td>{p.name}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCLP(p.price)}</td>
                    <td>{p.category || '—'}</td>
                    <td>{p.size || '—'}</td>
                    <td>{p.stock}</td>
                    <td>
                      <span className={`admin-badge ${p.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="btn btn-sm"
                          onClick={() => setForm({ mode: 'edit', product: p })}
                          disabled={!!form}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => toggleInventory(p.id)}
                        >
                          Inventario
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => handleDelete(p)}
                          disabled={deletingId === p.id}
                        >
                          {deletingId === p.id ? 'Eliminando…' : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {inventory[p.id] && (
                    <tr className="admin-inventory-row">
                      <td colSpan={7}>
                        {inventory[p.id].loading
                          ? 'Consultando inventario (G4)…'
                          : inventory[p.id].error
                            ? 'Sin datos de inventario (G4 no reconoce este producto).'
                            : `Inventario G4 — stock total: ${inventory[p.id].data.stockTotal ?? '—'} · reservado: ${inventory[p.id].data.reservedQuantity ?? '—'} · disponible: ${inventory[p.id].data.availableStock ?? '—'}`}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="admin-toolbar" style={{ marginTop: 12, justifyContent: 'center' }}>
          <button
            className="btn btn-sm"
            disabled={!pagination.hasPrev || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Anterior
          </button>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <button
            className="btn btn-sm"
            disabled={!pagination.hasNext || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
