import { useState } from 'react';
import { loginUserUseCase } from '../../config/di.js';

export function useAuth() {
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

  const setAuthenticatedUser = (name, jwtToken) => {
    setUser(name);
    setToken(jwtToken);
    setIsLoggedIn(true);
    setErrorMsg('');
  };

  const logout = () => {
    setIsLoggedIn(false);
    setToken(null);
    setUser(null);
    setErrorMsg('');
  };

  return {
    isLoggedIn,
    token,
    user,
    errorMsg,
    setErrorMsg,
    loading,
    login,
    logout,
    setAuthenticatedUser
  };
}
