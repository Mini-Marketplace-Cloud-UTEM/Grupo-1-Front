import React, { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../adapters/hooks/useAuth.jsx';
import AdminItemsSection from '../components/admin/AdminItemsSection.jsx';
import AdminUsersSection from '../components/admin/AdminUsersSection.jsx';
import AdminStatsSection from '../components/admin/AdminStatsSection.jsx';
import '../styles/adminDashboard.css';

const TABS = [
  { id: 'items', label: 'Items' },
  { id: 'users', label: 'Usuarios' },
  { id: 'stats', label: 'Estadísticas' },
];

// Panel de administracion: Items (CRUD productos, G3+G4), Usuarios (G2) y
// Estadisticas (reportes G7). La ruta ya viene protegida por RequireAdmin;
// aca solo queda manejar la expiracion del token en caliente: cualquier
// 401 de una llamada admin cierra la sesion y vuelve al login con aviso
// (G2 no ofrece refresh confiable, asi que no se intenta renovar).
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('items');

  const handleAuthError = useCallback(
    (err) => {
      if (err?.status === 401) {
        // El aviso viaja por sessionStorage y no por navigation state: al
        // hacer logout(), RequireAdmin tambien dispara su propio <Navigate>
        // sin state y pisa el nuestro (carrera perdida de forma aleatoria).
        try {
          sessionStorage.setItem('adminSessionExpired', '1');
        } catch { /* sin storage el aviso simplemente no se muestra */ }
        logout();
        navigate('/admin/login');
        return true;
      }
      return false;
    },
    [logout, navigate]
  );

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Panel de Administración</h1>
        <div className="admin-header-user">
          <Link to="/tienda" style={{ color: 'var(--color-text-secondary)' }}>
            Ver tienda
          </Link>
          <span>{user?.name}</span>
          <button className="btn btn-sm" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <nav className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`admin-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'items' && <AdminItemsSection onAuthError={handleAuthError} />}
      {tab === 'users' && <AdminUsersSection onAuthError={handleAuthError} />}
      {tab === 'stats' && <AdminStatsSection onAuthError={handleAuthError} />}
    </div>
  );
}
