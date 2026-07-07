import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Login from './components/Login';
import LandingPage from './pages/LandingPage';
import StorePage from './pages/StorePage';
import ProductPage from './pages/ProductPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import CheckoutPage from './pages/CheckoutPage';
import AyudaPostventa from './pages/AyudaPostventa';

import { AuthProvider, useAuth } from './adapters/hooks/useAuth.jsx';
import { CartProvider } from './adapters/hooks/useCart.jsx';
import { FavoritesProvider } from './adapters/hooks/useFavorites.jsx';

function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuth();

  React.useEffect(() => {
    if (isLoggedIn) {
      navigate('/tienda', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const handleLoginSuccess = () => {
    navigate('/tienda');
  };

  return <Login onLogin={login} onLoginSuccess={handleLoginSuccess} />;
}

// Guard para rutas que SI exigen sesion (checkout). Navegar/ver catalogo y
// armar el carrito NO requieren login: la tienda es publica. Solo pagar pide
// iniciar sesion, y a un invitado lo mandamos a /login (no al landing) para
// que pueda continuar la compra tras autenticarse.
function RequireAuth({ children, redirectTo = '/login' }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to={redirectTo} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<Register />} />
              {/* Tienda publica: cualquiera puede ver el catalogo y armar el carrito. */}
              <Route path="/tienda" element={<StorePage />} />
              <Route
                path="/checkout"
                element={
                  <RequireAuth>
                    <CheckoutPage />
                  </RequireAuth>
                }
              />
              <Route path="/productos/:id" element={<ProductPage />} />

              {/* Ayuda / Postventa: pagina estatica publica (aporte de Reynazo). */}
              <Route path="/ayuda-postventa" element={<AyudaPostventa />} />

              {/* Admin: rutas separadas, sin link visible desde la tienda principal */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
