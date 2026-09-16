export default function GlassPanel({ className = '', children }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-frost backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}
