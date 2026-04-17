import { useState } from "react";
import GlassCard from "../components/ui/GlassCard.jsx";
import Btn       from "../components/ui/Btn.jsx";
import Badge     from "../components/ui/Badge.jsx";
import StatCard  from "../components/ui/StatCard.jsx";
import { STORE_PRODUCTS } from "../data/store.js";

const CATEGORIES = ["All", ...Array.from(new Set(STORE_PRODUCTS.map((p) => p.category)))];

const EMPTY = { name: "", price: "", category: "Yoga Equipment", desc: "", emoji: "🛍️" };

export default function ShopDashboard() {
  const [products,   setProducts]   = useState(STORE_PRODUCTS);
  const [filterCat,  setFilterCat]  = useState("All");
  const [search,     setSearch]     = useState("");
  const [editId,     setEditId]     = useState(null);   // null = closed, 0 = new
  const [form,       setForm]       = useState(EMPTY);

  const filtered = products.filter(
    (p) =>
      (filterCat === "All" || p.category === filterCat) &&
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openNew  = () => { setForm(EMPTY); setEditId(0); };
  const openEdit = (p) => { setForm({ ...p }); setEditId(p.id); };
  const closeModal = () => setEditId(null);

  const handleSave = () => {
    if (!form.name || !form.price) return;
    if (editId === 0) {
      setProducts((prev) => [...prev, { ...form, id: Date.now(), price: +form.price, rating: 5.0, reviews: 0 }]);
    } else {
      setProducts((prev) => prev.map((p) => (p.id === editId ? { ...p, ...form, price: +form.price } : p)));
    }
    closeModal();
  };

  const handleDelete = (id) => setProducts((prev) => prev.filter((p) => p.id !== id));

  const stats = [
    { icon: "📦", label: "Total Products", value: String(products.length),         color: "#3b82f6" },
    { icon: "🛍️", label: "Categories",    value: String(CATEGORIES.length - 1),   color: "#8b5cf6" },
    { icon: "⭐", label: "Avg Rating",     value: (products.reduce((s, p) => s + p.rating, 0) / products.length).toFixed(1), color: "#f59e0b" },
    { icon: "💬", label: "Total Reviews",  value: String(products.reduce((s, p) => s + (p.reviews ?? 0), 0)), color: "#10b981" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Product Inventory</h2>
          <p className="text-gray-500 text-sm mt-0.5">Manage your store products</p>
        </div>
        <Btn onClick={openNew}>+ Add Product</Btn>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* filters */}
      <GlassCard className="p-4 flex flex-wrap gap-3 items-center">
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 flex-1 min-w-[160px]"
        />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setFilterCat(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterCat === c ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {c}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* product table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Product", "Category", "Price", "Rating", "Reviews", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{p.emoji}</span>
                      <div>
                        <div className="font-semibold text-gray-800">{p.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{p.desc}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge color="blue">{p.category}</Badge>
                  </td>
                  <td className="px-5 py-4 font-bold text-gray-800">₹{p.price}</td>
                  <td className="px-5 py-4">
                    <span className="text-amber-500 font-semibold">⭐ {p.rating}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{p.reviews}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(p.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-500 text-xs font-semibold hover:bg-rose-100 transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* add/edit modal */}
      {editId !== null && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800">{editId === 0 ? "Add Product" : "Edit Product"}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            {[
              { name: "name",     label: "Product Name", type: "text",   placeholder: "e.g. Yoga Mat"   },
              { name: "price",    label: "Price (₹)",    type: "number", placeholder: "e.g. 999"         },
              { name: "emoji",    label: "Emoji",        type: "text",   placeholder: "e.g. 🧘"          },
              { name: "desc",     label: "Description",  type: "text",   placeholder: "Short description" },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-xs font-semibold text-gray-500 mb-1">{f.label}</label>
                <input
                  name={f.name} value={form[f.name]} type={f.type} placeholder={f.placeholder}
                  onChange={(e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                {CATEGORIES.filter((c) => c !== "All").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Btn onClick={handleSave} className="flex-1 justify-center">
                {editId === 0 ? "Add Product" : "Save Changes"}
              </Btn>
              <Btn variant="ghost" onClick={closeModal} className="flex-1 justify-center text-gray-500">
                Cancel
              </Btn>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}