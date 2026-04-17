const VARIANTS = {
  primary:   "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-200",
  secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
  ghost:     "text-gray-600 hover:bg-gray-100",
  danger:    "bg-red-500 text-white hover:bg-red-600",
};

export default function Btn({ children, onClick, variant = "primary", className = "", disabled = false, type = "button" }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${VARIANTS[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}>
      {children}
    </button>
  );
}