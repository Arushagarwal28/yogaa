import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, saveToken, clearToken, getToken } from "../utils/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [coins,   setCoins]   = useState(0);
  const [loading, setLoading] = useState(true);

  // Restore session on page load
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

  // Used by demo/guest login — reads actual coins from userData, no hardcoded value
  const loginWithData = (userData) => {
    setUser(userData);
    setCoins(userData.coins ?? 0);
  };

  const logout = () => { clearToken(); setUser(null); setCoins(0); };

  // Optimistic increment — called immediately when a session ends so the UI feels instant
  const addCoins = (n) => setCoins((c) => c + n);

  // Re-fetch the authoritative coin count from the server.
  // Call this after endSession to correct any drift between optimistic state and DB.
  const refreshCoins = useCallback(async () => {
    try {
      const { user: u } = await authApi.me();
      setCoins(u.coins ?? 0);
      setUser((prev) => (prev ? { ...prev, coins: u.coins ?? 0 } : prev));
    } catch {
      // Non-critical — the optimistic value from addCoins is still shown
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