const COLORS = {
  green:"bg-emerald-100 text-emerald-700", blue:"bg-blue-100 text-blue-700",
  purple:"bg-purple-100 text-purple-700",  orange:"bg-orange-100 text-orange-700",
  gray:"bg-gray-100 text-gray-600",        red:"bg-red-100 text-red-600",
};

export default function Badge({ children, color = "green" }) {
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${COLORS[color]}`}>{children}</span>;
}