import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { authApi } from "../../utils/api.js";

/* ── OTP input: 6 individual boxes ─────────────────────────────────────── */
function OtpInput({ value, onChange, disabled }) {
  const inputs = useRef([]);

  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !e.target.value && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handleChange = (i, e) => {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    const arr  = value.split("").concat(Array(6).fill("")).slice(0, 6);
    arr[i]     = char;
    const next = arr.join("");
    onChange(next);
    if (char && i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6));
    inputs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          disabled={disabled}
          className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all focus:outline-none
            ${value[i]
              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
              : "border-gray-200 text-gray-800"}
            ${disabled ? "opacity-50 cursor-not-allowed" : "focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"}`}
        />
      ))}
    </div>
  );
}

/* ── Main modal ─────────────────────────────────────────────────────────── */
export default function AuthModal({ onClose }) {
  const { login, register, verifyEmail, loginWithData } = useAuth();

  // "login" | "register" | "otp"
  const [step,    setStep]    = useState("login");
  const [role,    setRole]    = useState("user");
  const [form,    setForm]    = useState({ name: "", email: "", password: "" });
  const [otp,     setOtp]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [info,    setInfo]    = useState(""); // success/info messages
  const [resendCountdown, setResendCountdown] = useState(0);

  const overlayRef  = useRef(null);
  const countdownRef = useRef(null);

  const clearMessages = () => { setError(""); setInfo(""); };

  /* Resend-OTP countdown timer */
  const startResendCountdown = (secs = 60) => {
    setResendCountdown(secs);
    countdownRef.current = setInterval(() => {
      setResendCountdown((c) => {
        if (c <= 1) { clearInterval(countdownRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(countdownRef.current), []);

  /* Close on backdrop click */
  const handleOverlay = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  /* ── Login ──────────────────────────────────────────────────────────── */
  const handleLogin = async () => {
    if (!form.email || !form.password) { setError("Please fill all fields"); return; }
    setLoading(true); clearMessages();
    try {
      await login(form.email, form.password);
      onClose();
    } catch (err) {
      // Server echoes email + code when account exists but is unverified
      if (err.code === "EMAIL_NOT_VERIFIED") {
        setStep("otp");
        setForm((f) => ({ ...f, email: err.email || form.email }));
        startResendCountdown();
        setInfo("Your email isn't verified yet — enter the OTP we sent you.");
      } else if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
        loginWithData({ name: form.name || "Demo User", email: form.email, role, coins: 0 });
        onClose();
      } else {
        setError(err.message || "Something went wrong");
      }
    } finally { setLoading(false); }
  };

  /* ── Register ───────────────────────────────────────────────────────── */
  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { setError("Please fill all fields"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true); clearMessages();
    try {
      await register(form.name, form.email, form.password, role);
      // Server returns { email, message } — move to OTP step
      setStep("otp");
      setOtp("");
      startResendCountdown();
      setInfo(`We've sent a 6-digit code to ${form.email}`);
    } catch (err) {
      if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
        loginWithData({ name: form.name || "Demo User", email: form.email, role, coins: 0 });
        onClose();
      } else {
        setError(err.message || "Registration failed");
      }
    } finally { setLoading(false); }
  };

  /* ── Verify OTP ─────────────────────────────────────────────────────── */
  const handleVerify = async () => {
    if (otp.replace(/\D/g, "").length !== 6) { setError("Please enter the complete 6-digit code"); return; }
    setLoading(true); clearMessages();
    try {
      await verifyEmail(form.email, otp.trim());
      onClose(); // AuthContext sets the user → dashboard opens
    } catch (err) {
      setError(err.message || "Verification failed");
      setOtp(""); // clear boxes so they can re-enter
    } finally { setLoading(false); }
  };

  /* ── Resend OTP ─────────────────────────────────────────────────────── */
  const handleResend = async () => {
    if (resendCountdown > 0) return;
    setLoading(true); clearMessages();
    try {
      await authApi.resendOtp(form.email);
      setOtp("");
      startResendCountdown();
      setInfo("New code sent — check your inbox");
    } catch (err) {
      setError(err.message || "Could not resend OTP");
    } finally { setLoading(false); }
  };

  /* ── Shared input style ─────────────────────────────────────────────── */
  const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white";

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlay}
      className="modal-overlay fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
    >
      <div className="modal-box relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Colour bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 transition-all"
        >✕</button>

        <div className="px-8 pt-7 pb-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl">Y</span>
            </div>
            <div>
              <div className="font-black text-gray-800 text-xl">YogaAI</div>
              <div className="text-xs text-emerald-600 font-medium">AI-Powered Wellness</div>
            </div>
          </div>

          {/* ── OTP step ─────────────────────────────────────────────── */}
          {step === "otp" && (
            <>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">📬</div>
                <h2 className="text-lg font-bold text-gray-800">Verify your email</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Enter the 6-digit code sent to
                </p>
                <p className="text-sm font-semibold text-emerald-600 mt-0.5">{form.email}</p>
              </div>

              <OtpInput value={otp} onChange={setOtp} disabled={loading} />

              {info  && <p className="text-emerald-600 text-sm mt-3 bg-emerald-50 px-3 py-2 rounded-lg text-center">{info}</p>}
              {error && <p className="text-red-500  text-sm mt-3 bg-red-50   px-3 py-2 rounded-lg text-center">{error}</p>}

              <button
                onClick={handleVerify}
                disabled={loading || otp.replace(/\D/g, "").length !== 6}
                className="w-full mt-5 py-3.5 rounded-xl font-bold text-base text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#10b981,#0d9488)" }}
              >
                {loading && <span className="animate-spin text-lg">⟳</span>}
                {loading ? "Verifying…" : "Verify Email →"}
              </button>

              {/* Resend */}
              <div className="text-center mt-4">
                <span className="text-xs text-gray-400">Didn't receive it? </span>
                {resendCountdown > 0 ? (
                  <span className="text-xs text-gray-400">Resend in {resendCountdown}s</span>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="text-xs text-emerald-600 font-semibold hover:underline disabled:opacity-50"
                  >
                    Resend code
                  </button>
                )}
              </div>

              {/* Back link */}
              <button
                onClick={() => { setStep("register"); clearMessages(); setOtp(""); }}
                className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← Back to registration
              </button>
            </>
          )}

          {/* ── Login / Register step ─────────────────────────────────── */}
          {step !== "otp" && (
            <>
              {/* Tab switcher */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
                {["Login", "Sign Up"].map((t, i) => (
                  <button
                    key={t}
                    onClick={() => { setStep(i === 0 ? "login" : "register"); clearMessages(); }}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      (step === "login") === (i === 0) ? "bg-white shadow text-gray-800" : "text-gray-500"
                    }`}
                  >{t}</button>
                ))}
              </div>

              {/* Role selector */}
              <div className="flex gap-3 mb-5">
                {[{ val: "user", label: "👤 Yoga User" }, { val: "shop", label: "🏪 Shop Owner" }].map((r) => (
                  <button
                    key={r.val}
                    onClick={() => setRole(r.val)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      role === r.val ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500"
                    }`}
                  >{r.label}</button>
                ))}
              </div>

              {/* Fields */}
              <div className="space-y-4">
                {step === "register" && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Full Name</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Priya Sharma"
                      className={inputCls}
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    onKeyDown={(e) => e.key === "Enter" && (step === "login" ? handleLogin() : handleRegister())}
                    className={inputCls}
                  />
                  {step === "register" && (
                    <p className="text-xs text-gray-400 mt-1 ml-1">Minimum 6 characters</p>
                  )}
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mt-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              {info  && <p className="text-emerald-600 text-sm mt-3 bg-emerald-50 px-3 py-2 rounded-lg">{info}</p>}

              <button
                onClick={step === "login" ? handleLogin : handleRegister}
                disabled={loading}
                className="w-full mt-5 py-3.5 rounded-xl font-bold text-base text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#10b981,#0d9488)" }}
              >
                {loading && <span className="animate-spin text-lg">⟳</span>}
                {loading
                  ? "Please wait…"
                  : step === "login"
                  ? "Login to YogaAI →"
                  : "Create Account →"}
              </button>

              {step === "register" && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  A verification code will be sent to your email
                </p>
              )}
              <p className="text-center text-xs text-gray-300 mt-2">
                Demo mode works without a backend connection
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}