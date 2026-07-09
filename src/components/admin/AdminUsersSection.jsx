import React, { useEffect, useState } from 'react';
import { adminDeleteUser, adminFetchUsers } from '../../api.js';
import { useAuth } from '../../adapters/hooks/useAuth.jsx';

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-CL');
};

// Seccion Usuarios: listar y eliminar cuentas (via BFF -> G2).
// El boton de eliminar va deshabilitado en la fila del propio admin; el BFF
// ademas lo rechaza con 409 CANNOT_DELETE_SELF (defensa doble).
export default function AdminUsersSection({ onAuthError }) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    adminFetchUsers()
      .then((body) => {
        if (!cancelled) setUsers(body.data || []);
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
  }, [reloadKey, onAuthError]);

  const reload = () => setReloadKey((k) => k + 1);

  const handleDelete = async (u) => {
    const ok = window.confirm(
      `¿Eliminar la cuenta de "${u.name}" (${u.email})? Esta acción no se puede deshacer.`
    );
    if (!ok) return;
    setDeletingId(u.id);
    try {
      await adminDeleteUser(u.id);
      reload();
    } catch (err) {
      if (onAuthError?.(err)) return;
      if (err.code === 'CANNOT_DELETE_SELF') {
        setError('No puedes eliminar tu propia cuenta de administrador.');
      } else {
        setError(err.message);
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-head">
        <h2>Usuarios registrados</h2>
        <button className="btn btn-sm" onClick={reload} disabled={loading}>
          Actualizar
        </button>
      </div>

      {error && (
        <div className="error-msg">
          <span>{error}</span>
        </div>
      )}

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Cargando usuarios…</div>
        ) : users.length === 0 ? (
          <div className="admin-empty">No hay usuarios registrados.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Activo</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = currentUser?.id && u.id === currentUser.id;
                return (
                  <tr key={u.id}>
                    <td>{u.name || '—'}</td>
                    <td>{u.email}</td>
                    <td>
                      {(u.roles || []).map((r) => (
                        <span
                          key={r}
                          className={`admin-badge ${r === 'admin' ? 'role-admin' : ''}`}
                          style={{ marginRight: 4 }}
                        >
                          {r}
                        </span>
                      ))}
                    </td>
                    <td>
                      <span className={`admin-badge ${u.active ? 'active' : 'inactive'}`}>
                        {u.active ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>
                      <button
                        className="btn btn-sm"
                        onClick={() => handleDelete(u)}
                        disabled={isSelf || deletingId === u.id}
                        title={isSelf ? 'No puedes eliminar tu propia cuenta.' : undefined}
                      >
                        {deletingId === u.id ? 'Eliminando…' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
