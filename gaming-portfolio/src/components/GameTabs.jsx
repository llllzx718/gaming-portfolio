import { motion } from 'framer-motion';
import { getIcon } from '../lib/icons';

export default function GameTabs({ games, activeId, onChange }) {
  return (
    <nav className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl">
      {games.map((game) => {
        const Icon = getIcon(game.icon);
        const active = game.id === activeId;
        return (
          <button
            key={game.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(game.id)}
            className="relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
          >
            {active && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute inset-0 rounded-xl border border-white/10"
                style={{ background: `${game.accent}26` }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <Icon
              className="relative z-10 h-4 w-4"
              style={{ color: active ? game.accent : undefined }}
              strokeWidth={1.75}
            />
            <span className={`relative z-10 ${active ? 'text-white' : 'text-slate-400'}`}>
              {game.name}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
