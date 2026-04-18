import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { calcBMI, bmiCategory } from "../utils/bmi.js";

const BMI_TIPS = {
  Underweight: "Consider a balanced diet with more calories and light strength training.",
  Healthy:     "Great! Maintain your current lifestyle and keep practising yoga.",
  Overweight:  "Regular yoga and a mindful diet can help you reach a healthy weight.",
  Obese:       "Consult a healthcare professional and start with gentle yoga sessions.",
};

export default function ProfilePage() {
  const { user, coins } = useAuth();

  const [form, setForm] = useState({
    name:   user?.name  ?? "",
    email:  user?.email ?? "",
    age:    "",
    height: "",
    weight: "",
  });

  const [saved,     setSaved]     = useState(false);
  const [bmiResult, setBmiResult] = useState(null);  // { value: number, info: object } | null
  const [showError, setShowError] = useState(false); // only true after a failed Calculate click

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setSaved(false);
    if (e.target.name === "height" || e.target.name === "weight") setShowError(false);
  };

  const handleBMI = () => {
    const h = parseFloat(form.height);
    const w = parseFloat(form.weight);
    if (!form.height || !form.weight || isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
      setShowError(true);
      setBmiResult(null);
      return;
    }
    setShowError(false);
    // calcBMI returns a string like "22.5" — parse to number for bmiCategory comparison
    const num = parseFloat(calcBMI(h, w));
    if (isNaN(num)) { setShowError(true); return; }
    setBmiResult({ value: num, info: bmiCategory(num) });
  };

  const clearBMI = () => {
    setBmiResult(null);
    setShowError(false);
    setForm((f) => ({ ...f, height: "", weight: "" }));
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
        <p className="text-gray-500 text-sm mt-1">Manage your account details</p>
      </div>

      {/* Avatar card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-full flex items-center justify-center text-white text-4xl font-bold flex-shrink-0 shadow-lg shadow-emerald-200">
          {(form.name || user?.name || "U")[0].toUpperCase()}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl font-bold text-gray-800">{form.name || user?.name || "Your Name"}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{form.email || user?.email || "your@email.com"}</p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-3 py-1.5 rounded-full">
              🪙 {coins} coins
            </span>
            <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              👤 {user?.role === "shop" ? "Shop Owner" : "Member"}
            </span>
            {bmiResult && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full border"
                style={{ background: `${bmiResult.info.color}18`, borderColor: `${bmiResult.info.color}50`, color: bmiResult.info.color }}>
                BMI {bmiResult.value.toFixed(1)} · {bmiResult.info.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-gray-800">Personal Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { name: "name",  label: "Full Name",     type: "text",   placeholder: "Your name"    },
            { name: "email", label: "Email Address", type: "email",  placeholder: "you@email.com" },
            { name: "age",   label: "Age",           type: "number", placeholder: "e.g. 25"       },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{f.label}</label>
              <input name={f.name} value={form[f.name]} onChange={handleChange} type={f.type}
                placeholder={f.placeholder}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all" />
            </div>
          ))}
        </div>
        <button onClick={() => setSaved(true)}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
          {saved ? "✅ Saved!" : "Save Changes"}
        </button>
      </div>

      {/* BMI Calculator */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800">🧮 BMI Calculator</h3>
          {bmiResult && (
            <button onClick={clearBMI} className="text-xs text-gray-400 hover:text-rose-500 transition-colors">Clear ✕</button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            { name: "height", label: "Height (cm)", placeholder: "e.g. 170" },
            { name: "weight", label: "Weight (kg)", placeholder: "e.g. 65"  },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{f.label}</label>
              <input name={f.name} value={form[f.name]} onChange={handleChange} type="number"
                placeholder={f.placeholder}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all
                  ${showError && !form[f.name] ? "border-rose-300 bg-rose-50" : "border-gray-200"}`} />
            </div>
          ))}
        </div>

        {/* Error — ONLY shown after clicking with empty/invalid input */}
        {showError && (
          <p className="text-xs text-rose-500">⚠️ Please enter a valid height and weight first.</p>
        )}

        <button onClick={handleBMI}
          className="border-2 border-emerald-500 text-emerald-600 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors">
          Calculate BMI
        </button>

        {/* Result card */}
        {bmiResult && (
          <div className="rounded-2xl border p-5 space-y-4"
            style={{ background: `${bmiResult.info.color}0d`, borderColor: `${bmiResult.info.color}40` }}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg flex-shrink-0"
                style={{ background: `linear-gradient(135deg,${bmiResult.info.color},${bmiResult.info.color}99)` }}>
                {bmiResult.value.toFixed(1)}
              </div>
              <div>
                <div className="font-bold text-gray-800 text-lg">{bmiResult.info.label}</div>
                <div className="text-sm text-gray-500">{form.height} cm · {form.weight} kg</div>
              </div>
            </div>
            {/* Scale bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
              </div>
              <div className="relative h-3 rounded-full"
                style={{ background: "linear-gradient(to right,#60a5fa 0%,#4ade80 30%,#fbbf24 65%,#f87171 100%)" }}>
                <div className="absolute top-1/2 w-4 h-4 bg-white border-2 rounded-full shadow-md"
                  style={{
                    borderColor: bmiResult.info.color,
                    left: `${Math.min(98, Math.max(2, ((bmiResult.value - 15) / 25) * 100))}%`,
                    transform: "translate(-50%,-50%)",
                  }} />
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{BMI_TIPS[bmiResult.info.label]}</p>
          </div>
        )}
      </div>
    </div>
  );
}