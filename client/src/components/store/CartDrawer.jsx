import Btn from "../ui/Btn.jsx";

export default function CartDrawer({ cart, coins, onClose }) {
  const total        = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const coinDiscount = Math.min(coins * 0.5, total * 0.1);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm h-full flex flex-col shadow-2xl">
        <div className="p-5 border-b flex items-center justify-between">
          <h3 className="font-bold text-gray-800">Shopping Cart ({cart.reduce((s, i) => s + i.qty, 0)})</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <p className="text-center text-gray-400 py-12">Your cart is empty 🛒</p>
          ) : cart.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-2xl">{item.emoji}</span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-700">{item.name}</div>
                <div className="text-xs text-gray-500">₹{item.price} × {item.qty}</div>
              </div>
              <div className="font-bold text-gray-800 text-sm">₹{item.price * item.qty}</div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="p-5 border-t space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-semibold">₹{total}</span></div>
            <div className="flex justify-between text-sm text-emerald-600"><span>🪙 Coin Discount</span><span>-₹{coinDiscount.toFixed(0)}</span></div>
            <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>₹{(total - coinDiscount).toFixed(0)}</span></div>
            <Btn className="w-full py-3 justify-center flex" onClick={() => alert("Redirecting to Razorpay…")}>Pay with Razorpay</Btn>
          </div>
        )}
      </div>
    </div>
  );
}