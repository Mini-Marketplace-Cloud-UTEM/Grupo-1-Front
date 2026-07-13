import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate
} from 'react-router-dom';

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

// Páginas informativas
import TerminosCondiciones from './pages/TerminosCondiciones';
import PoliticaPrivacidad from './pages/PoliticaPrivacidad';
import GarantiaServicio from './pages/GarantiaServicio';
import CentrosRetiro from './pages/CentrosRetiro';

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

  return (
    <Login
      onLogin={login}
      onLoginSuccess={handleLoginSuccess}
    />
  );
}

// Guard para rutas que SI exigen sesion (checkout). Navegar/ver catalogo y
// armar el carrito NO requieren login: la tienda es publica. Solo pagar pide
// iniciar sesion, y a un invitado lo mandamos a /login (no al landing) para
// que pueda continuar la compra tras autenticarse.
function RequireAuth({ children, redirectTo = '/login' }) {
  const { isLoggedIn } = useAuth();

  return isLoggedIn
    ? children
    : <Navigate to={redirectTo} replace />;
}

// Guard del panel admin: ademas de sesion exige el rol admin (viene en el
// JWT de G2 via login y persiste en localStorage). Un customer logueado
// tambien rebota a /admin/login, donde vera el error de permisos si intenta
// entrar con esa cuenta. La proteccion real esta en el BFF (require_admin);
// esto solo evita mostrar un panel que no va a poder cargar nada.
function RequireAdmin({ children }) {
  const { isLoggedIn, isAdmin } = useAuth();

  return isLoggedIn && isAdmin
    ? children
    : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <Routes>
              <Route
                path="/"
                element={<LandingPage />}
              />

              <Route
                path="/login"
                element={<LoginPage />}
              />

              <Route
                path="/registro"
                element={<Register />}
              />

              {/* Tienda publica: cualquiera puede ver el catalogo y armar el carrito. */}
              <Route
                path="/tienda"
                element={<StorePage />}
              />

              <Route
                path="/checkout"
                element={
                  <RequireAuth>
                    <CheckoutPage />
                  </RequireAuth>
                }
              />

              <Route
                path="/productos/:id"
                element={<ProductPage />}
              />

              {/* Ayuda / Postventa */}
              <Route
                path="/ayuda-postventa"
                element={<AyudaPostventa />}
              />

              {/* Páginas informativas del footer */}
              <Route
                path="/terminos-condiciones"
                element={<TerminosCondiciones />}
              />

              <Route
                path="/politica-privacidad"
                element={<PoliticaPrivacidad />}
              />

              <Route
                path="/garantia-servicio"
                element={<GarantiaServicio />}
              />

              <Route
                path="/centros-retiro"
                element={<CentrosRetiro />}
              />

              {/* Admin: rutas separadas, sin link visible desde la tienda principal */}
              <Route
                path="/admin/login"
                element={<AdminLogin />}
              />

              <Route
                path="/admin/dashboard"
                element={
                  <RequireAdmin>
                    <AdminDashboard />
                  </RequireAdmin>
                }
              />

              <Route
                path="*"
                element={<NotFound />}
              />
            </Routes>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}