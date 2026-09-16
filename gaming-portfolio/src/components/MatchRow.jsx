import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ResultBadge from './ResultBadge';

export default function MatchRow({ match, columns, index }) {
  const [open, setOpen] = useState(false);
  const details = Array.isArray(match.details) ? match.details : [];
  const expandable = details.length > 0;
  const toggle = () => { if (expandable) setOpen((v) => !v); };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03, duration: 0.25 }}
        data-testid="match-row"
        onClick={toggle}
        aria-expanded={expandable ? open : undefined}
        role={expandable ? 'button' : undefined}
        tabIndex={expandable ? 0 : undefined}
        className={`grid items-center gap-2 px-4 py-3 transition-colors hover:bg-white/5 ${expandable ? 'cursor-pointer' : ''}`}
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        {columns.map((col) => {
          const value = match[col.key];
          return col.key === 'result' ? (
            <ResultBadge key={col.key} result={value} />
          ) : (
            <span key={col.key} className="truncate text-sm text-slate-300">{value ?? '—'}</span>
          );
        })}
      </motion.div>
      <AnimatePresence initial={false}>
        {open && expandable && (
          <motion.div
            key="match-details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
            data-testid="match-details"
          >
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-4 py-3 sm:grid-cols-3">
              {details.map((d) => (
                <div key={d.label} className="flex items-baseline gap-2">
                  <span className="text-xs uppercase tracking-wider text-slate-500">{d.label}</span>
                  <span className="text-sm text-slate-300">{d.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
