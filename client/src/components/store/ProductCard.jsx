import GlassCard from "../ui/GlassCard.jsx";
import Btn       from "../ui/Btn.jsx";

export default function ProductCard({ product, onAdd }) {
  return (
    <GlassCard className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
      <div className="h-36 flex items-center justify-center text-6xl" style={{ background: "linear-gradient(135deg,#f0fdf4,#dcfce7)" }}>
        {product.emoji}
      </div>
      <div className="p-4">
        <div className="text-xs text-emerald-600 font-semibold mb-1">{product.category}</div>
        <div className="font-bold text-gray-800 text-sm mb-1">{product.name}</div>
        <div className="text-xs text-gray-500 mb-2">{product.desc}</div>
        <div className="flex items-center gap-1 mb-3">
          <span className="text-yellow-400 text-xs">{"★".repeat(Math.floor(product.rating))}</span>
          <span className="text-xs text-gray-400">({product.reviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-800">₹{product.price}</span>
          <Btn onClick={() => onAdd(product)} className="!py-1.5 !px-3 !text-xs">Add to Cart</Btn>
        </div>
      </div>
    </GlassCard>
  );
}