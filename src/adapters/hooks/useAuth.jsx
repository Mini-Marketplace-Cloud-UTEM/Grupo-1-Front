import { createContext, useContext, useState } from 'react';
import { loginUserUseCase, registerUserUseCase } from '../../config/di.js';
import { setAuthToken } from '../../api.js';

// Context, no solo un hook con useState local - varios componentes
// (LoginPage, RequireAuth, StorePage, etc.) necesitan ver el MISMO
// estado de sesion. Un hook con useState propio le daria a cada uno su
// propia copia desincronizada.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
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
    setIsLoggedIn(true);
    setErrorMsg('');
  };

  const logout = () => {
    setIsLoggedIn(false);
    setToken(null);
    setAuthToken(null);
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
