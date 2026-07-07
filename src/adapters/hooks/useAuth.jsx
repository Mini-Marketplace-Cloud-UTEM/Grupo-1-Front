import { createContext, useContext, useRef, useState } from 'react';
import { loginUserUseCase, registerUserUseCase } from '../../config/di.js';
import { setAuthToken } from '../../api.js';

// Context, no solo un hook con useState local - varios componentes
// (LoginPage, RequireAuth, StorePage, etc.) necesitan ver el MISMO
// estado de sesion. Un hook con useState propio le daria a cada uno su
// propia copia desincronizada.
const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'auth';

// Lee la sesion guardada (si la hay). Se evalua UNA vez al construir el
// provider, antes de que rendericen los hijos (CartProvider), asi el token
// queda disponible en el cliente api cuando el carrito intente recuperarse.
function loadPersistedSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { token: null, user: null };
    const parsed = JSON.parse(raw);
    return { token: parsed.token || null, user: parsed.user || null };
  } catch {
    return { token: null, user: null };
  }
}

function persistSession(token, user) {
  try {
    if (token) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }));
    else localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Almacenamiento no disponible (modo incognito estricto, etc.): la sesion
    // simplemente no persistira, pero la app sigue funcionando en memoria.
  }
}

export function AuthProvider({ children }) {
  // Rehidratacion sincrona: el token viaja al cliente api en el PRIMER render,
  // antes de los efectos de los hijos (los efectos hijos corren antes que los
  // del padre, por eso NO se puede hacer esto en un useEffect del padre). El
  // guard evita re-setear el token viejo en renders posteriores (p.ej. despues
  // de un logout, donde 'initial' sigue conservando el token del arranque).
  const [initial] = useState(loadPersistedSession);
  const rehydrated = useRef(false);
  if (!rehydrated.current) {
    rehydrated.current = true;
    if (initial.token) setAuthToken(initial.token);
  }

  const [isLoggedIn, setIsLoggedIn] = useState(!!initial.token);
  const [token, setToken] = useState(initial.token);
  const [user, setUser] = useState(initial.user);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const loggedUser = await loginUserUseCase.execute(email, password);
      setUser(loggedUser.name);
      setToken(loggedUser.token);
      setAuthToken(loggedUser.token); // que bffFetch pueda adjuntar el Bearer
      persistSession(loggedUser.token, loggedUser.name); // sobrevive al refresh
      setIsLoggedIn(true);
      setErrorMsg('');
      return loggedUser;
    } catch (err) {
      setErrorMsg(err.message);
      setIsLoggedIn(false);
      setToken(null);
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const newUser = await registerUserUseCase.execute(name, email, password);
      setUser(newUser.name);
      setToken(newUser.token);
      setAuthToken(newUser.token); // queda logueado de una
      persistSession(newUser.token, newUser.name); // sobrevive al refresh
      setIsLoggedIn(true);
      setErrorMsg('');
      return newUser;
    } catch (err) {
      setErrorMsg(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setAuthenticatedUser = (name, jwtToken) => {
    setUser(name);
    setToken(jwtToken);
    setAuthToken(jwtToken);
    persistSession(jwtToken, name);
    setIsLoggedIn(true);
    setErrorMsg('');
  };

  const logout = () => {
    setIsLoggedIn(false);
    setToken(null);
    setAuthToken(null);
    persistSession(null, null); // borra la sesion guardada
    setUser(null);
    setErrorMsg('');
  };

  const value = {
    isLoggedIn,
    token,
    user,
    errorMsg,
    setErrorMsg,
    loading,
    login,
    register,
    logout,
    setAuthenticatedUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
