import { useState } from "react";
import GlassCard from "../components/ui/GlassCard.jsx";
import Btn       from "../components/ui/Btn.jsx";
import StatCard  from "../components/ui/StatCard.jsx";
import { calcBMI, bmiCategory } from "../utils/bmi.js";

export default function ProfilePage({ user, coins }) {
  const [form, setForm] = useState({
    name:   user?.name  ?? "",
    email:  user?.email ?? "",
    height: "",
    weight: "",
    age:    "",
  });
  const [saved,  setSaved]  = useState(false);
  const [bmiVal, setBmiVal] = useState(null);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setSaved(false);
    setBmiVal(null);
  };

  const handleSave = () => { setSaved(true); };

  const handleBMI = () => {
    const h = parseFloat(form.height);
    const w = parseFloat(form.weight);
    if (h > 0 && w > 0) setBmiVal(calcBMI(h, w));
  };

  const bmi     = bmiVal;
  const bmiInfo = bmi ? bmiCategory(bmi) : null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
        <p className="text-gray-500 text-sm mt-1">Manage your account details</p>
      </div>

      {/* avatar + stats */}
      <GlassCard className="p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-full flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
          {form.name?.[0]?.toUpperCase() ?? "U"}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl font-bold text-gray-800">{form.name || "Your Name"}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{form.email || "your@email.com"}</p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-3">
            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
              🪙 {coins} coins
            </span>
            <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
              👤 {user?.role === "shop" ? "Shop Owner" : "Member"}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* profile form */}
      <GlassCard className="p-6 space-y-4">
        <h3 className="font-bold text-gray-800">Personal Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { name: "name",  label: "Full Name",     type: "text",  placeholder: "Your name"    },
            { name: "email", label: "Email Address", type: "email", placeholder: "you@email.com" },
            { name: "age",   label: "Age",           type: "number",placeholder: "e.g. 25"       },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{f.label}</label>
              <input
                name={f.name} value={form[f.name]} onChange={handleChange}
                type={f.type} placeholder={f.placeholder}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
          ))}
        </div>
        <Btn onClick={handleSave} className="mt-2">
          {saved ? "✅ Saved!" : "Save Changes"}
        </Btn>
      </GlassCard>

      {/* BMI calculator */}
      <GlassCard className="p-6 space-y-4">
        <h3 className="font-bold text-gray-800">🧮 BMI Calculator</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Height (cm)</label>
            <input
              name="height" value={form.height} onChange={handleChange}
              type="number" placeholder="e.g. 170"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Weight (kg)</label>
            <input
              name="weight" value={form.weight} onChange={handleChange}
              type="number" placeholder="e.g. 65"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
        </div>
        <Btn variant="outline" onClick={handleBMI}>Calculate BMI</Btn>
        {bmiInfo && (
          <div
            className="mt-3 p-4 rounded-2xl border text-sm font-medium text-center"
            style={{ background: `${bmiInfo.color}15`, borderColor: `${bmiInfo.color}40`, color: bmiInfo.color }}
          >
            BMI: <strong>{bmi.toFixed(1)}</strong> — {bmiInfo.label}
            <p className="text-xs font-normal text-gray-500 mt-1">{bmiInfo.tip}</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}