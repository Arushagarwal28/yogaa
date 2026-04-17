import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AuthModal({ onClose }) {
  const { login, register, loginWithData } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [role,    setRole]    = useState("user");
  const [form,    setForm]    = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const overlayRef = useRef(null);

  const handleOverlay = (e) => { if (e.target === overlayRef.current) onClose(); };

  const handle = async () => {
    if (!form.email || !form.password || (!isLogin && !form.name)) { setError("Please fill all fields"); return; }
    setLoading(true); setError("");
    try {
      if (isLogin) await login(form.email, form.password);
      else         await register(form.name, form.email, form.password, role);
      onClose();
    } catch (err) {
      if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
        loginWithData({ name: form.name || "Demo User", email: form.email, role, coins: 247 });
        onClose();
      } else { setError(err.message || "Something went wrong"); }
    } finally { setLoading(false); }
  };

  return (
    <div ref={overlayRef} onClick={handleOverlay}
      className="modal-overlay fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}>
      <div className="modal-box relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 transition-all">✕</button>

        <div className="px-8 pt-7 pb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl">Y</span>
            </div>
            <div>
              <div className="font-black text-gray-800 text-xl">YogaAI</div>
              <div className="text-xs text-emerald-600 font-medium">AI-Powered Wellness</div>
            </div>
          </div>

          <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
            {["Login","Sign Up"].map((t,i) => (
              <button key={t} onClick={() => { setIsLogin(i===0); setError(""); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${(i===0)===isLogin ? "bg-white shadow text-gray-800" : "text-gray-500"}`}>{t}</button>
            ))}
          </div>

          <div className="flex gap-3 mb-5">
            {[{val:"user",label:"👤 Yoga User"},{val:"shop",label:"🏪 Shop Owner"}].map((r) => (
              <button key={r.val} onClick={() => setRole(r.val)}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${role===r.val ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500"}`}>{r.label}</button>
            ))}
          </div>

          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Full Name</label>
                <input value={form.name} onChange={(e) => setForm({...form,name:e.target.value})} placeholder="Priya Sharma"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white" />
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({...form,email:e.target.value})} placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({...form,password:e.target.value})}
                placeholder="••••••••" onKeyDown={(e) => e.key==="Enter" && handle()}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white" />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <button onClick={handle} disabled={loading}
            className="w-full mt-5 py-3.5 rounded-xl font-bold text-base text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg,#10b981,#0d9488)" }}>
            {loading && <span className="animate-spin text-lg">⟳</span>}
            {loading ? "Authenticating…" : isLogin ? "Login to YogaAI →" : "Create Account →"}
          </button>

          <p className="text-center text-xs text-gray-300 mt-3">Demo mode works without a backend connection</p>
        </div>
      </div>
    </div>
  );
}