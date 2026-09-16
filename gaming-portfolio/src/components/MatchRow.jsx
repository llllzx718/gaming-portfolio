import { motion } from 'framer-motion';
import ResultBadge from './ResultBadge';

export default function MatchRow({ match, columns, index }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      data-testid="match-row"
      className="grid items-center gap-2 px-4 py-3 transition-colors hover:bg-white/5"
      style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
    >
      {columns.map((col) => {
        const value = match[col.key];
        return col.key === 'result' ? (
          <ResultBadge key={col.key} result={value} />
        ) : (
          <span key={col.key} className="truncate text-sm text-slate-300">
            {value ?? '—'}
          </span>
        );
      })}
    </motion.div>
  );
}
