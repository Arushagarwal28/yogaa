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

  /**
   * register — calls POST /auth/register.
   * Does NOT log the user in. The server creates an unverified account and
   * sends an OTP email. The caller (AuthModal) should move to the OTP step.
   * Returns { email, message } on success.
   */
  const register = async (name, email, password, role) => {
    return authApi.register(name, email, password, role);
  };

  /**
   * verifyEmail — calls POST /auth/verify-email.
   * On success the server returns { token, user } → log the user in.
   */
  const verifyEmail = async (email, otp) => {
    const { token, user: u } = await authApi.verifyEmail(email, otp);
    saveToken(token);
    setUser(u);
    setCoins(u.coins ?? 0);
  };

  const login = async (email, password) => {
    const { token, user: u } = await authApi.login(email, password);
    saveToken(token);
    setUser(u);
    setCoins(u.coins ?? 0);
  };

  // Demo / offline fallback — uses actual coins from userData
  const loginWithData = (userData) => {
    setUser(userData);
    setCoins(userData.coins ?? 0);
  };

  const logout = () => { clearToken(); setUser(null); setCoins(0); };

  const addCoins = (n) => setCoins((c) => c + n);

  const refreshCoins = useCallback(async () => {
    try {
      const { user: u } = await authApi.me();
      setCoins(u.coins ?? 0);
      setUser((prev) => (prev ? { ...prev, coins: u.coins ?? 0 } : prev));
    } catch { /* silent */ }
  }, []);

  return (
    <AuthContext.Provider value={{
      user, coins, loading,
      login, loginWithData, register, verifyEmail, logout,
      addCoins, refreshCoins,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }