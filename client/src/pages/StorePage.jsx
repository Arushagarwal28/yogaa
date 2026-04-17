import { useState } from "react";
import ProductCard from "../components/store/ProductCard.jsx";
import CartDrawer  from "../components/store/CartDrawer.jsx";
import { STORE_PRODUCTS } from "../data/store.js";

export default function StorePage({ coins }) {
  const [cart,     setCart]     = useState([]);
  const [category, setCategory] = useState("All");
  const [cartOpen, setCartOpen] = useState(false);

  const categories = ["All", ...new Set(STORE_PRODUCTS.map((p) => p.category))];
  const filtered   = category === "All" ? STORE_PRODUCTS : STORE_PRODUCTS.filter((p) => p.category === category);

  const addToCart = (product) => {
    setCart((c) => {
      const exists = c.find((i) => i.id === product.id);
      return exists ? c.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i)) : [...c, { ...product, qty: 1 }];
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-800">Yoga Wellness Store</h2><p className="text-gray-500 text-sm">Premium yoga gear &amp; supplements</p></div>
        <button onClick={() => setCartOpen(true)} className="relative p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all">
          🛒<span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{cart.reduce((s,i)=>s+i.qty,0)}</span>
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {categories.map((c) => (
          <button key={c} onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${category===c ? "bg-emerald-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-300"}`}>{c}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((p) => <ProductCard key={p.id} product={p} onAdd={addToCart} />)}
      </div>
      {cartOpen && <CartDrawer cart={cart} coins={coins} onClose={() => setCartOpen(false)} />}
    </div>
  );
}