import GlassPanel from './GlassPanel';
import MatchRow from './MatchRow';

export default function MatchList({ matches, columns }) {
  return (
    <GlassPanel>
      <div
        className="grid items-center gap-2 border-b border-white/5 px-4 py-3 text-xs uppercase tracking-wider text-slate-400"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        {columns.map((col) => (
          <span key={col.key}>{col.label}</span>
        ))}
      </div>
      <div className="divide-y divide-white/5">
        {matches.map((m, i) => (
          <MatchRow key={i} match={m} columns={columns} index={i} />
        ))}
      </div>
    </GlassPanel>
  );
}
