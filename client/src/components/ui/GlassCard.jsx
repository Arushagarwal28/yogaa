export default function GlassCard({ children, className = "", onClick }) {
  return (
    <div onClick={onClick} className={`backdrop-blur-sm bg-white/80 border border-white/60 rounded-2xl shadow-lg ${className}`}>
      {children}
    </div>
  );
}