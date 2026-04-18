import { createContext, useContext, useState, useEffect, useCallback } from "react";
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
      .then(({ user: u }) => { setUser(u); setCoins(u.coins ?? 0); })
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const register = async (name, email, password, role) => {
    const { token, user: u } = await authApi.register(name, email, password, role);
    saveToken(token); setUser(u); setCoins(u.coins ?? 0);
  };

  const login = async (email, password) => {
    const { token, user: u } = await authApi.login(email, password);
    saveToken(token); setUser(u); setCoins(u.coins ?? 0);
  };

  const loginWithData = (userData) => {
    setUser(userData);
    setCoins(userData.coins ?? 0);
  };

  const logout = () => { clearToken(); setUser(null); setCoins(0); };

  // Optimistic local increment (used right after earning coins in YogaPage)
  const addCoins = (n) => setCoins((c) => c + n);

  // Re-fetch the live coin balance from the server — call after any session ends
  const refreshCoins = useCallback(async () => {
    try {
      const { user: u } = await authApi.me();
      setCoins(u.coins ?? 0);
      // Also keep user object in sync (name, role, etc. unchanged but coins updated)
      setUser((prev) => prev ? { ...prev, coins: u.coins } : prev);
    } catch {
      // silently ignore — the optimistic addCoins value is still shown
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user, coins, loading,
      login, loginWithData, register, logout,
      addCoins, refreshCoins,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }