import { createContext, useContext, useState, useEffect } from "react";
import { authApi, saveToken, clearToken, getToken } from "../utils/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [coins,   setCoins]   = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then(({ user: u }) => { setUser(u); setCoins(u.coins || 0); })
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const register = async (name, email, password, role) => {
    const { token, user: u } = await authApi.register(name, email, password, role);
    saveToken(token); setUser(u); setCoins(u.coins || 0);
  };

  const login = async (email, password) => {
    const { token, user: u } = await authApi.login(email, password);
    saveToken(token); setUser(u); setCoins(u.coins || 0);
  };

  const loginWithData = (userData) => { setUser(userData); setCoins(userData.coins || 247); };
  const logout        = () => { clearToken(); setUser(null); setCoins(0); };
  const addCoins      = (n) => setCoins((c) => c + n);

  return (
    <AuthContext.Provider value={{ user, coins, loading, login, loginWithData, register, logout, addCoins }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }