import { AnimatePresence, motion } from 'framer-motion';
import GameTabs from './components/GameTabs';
import HeroCard from './components/HeroCard';
import KpiGrid from './components/KpiGrid';
import MatchList from './components/MatchList';
import { useActiveGame } from './hooks/useActiveGame';
import { getSite } from './lib/games';

export default function App() {
  const { games, activeGame, activeId, setActiveId } = useActiveGame();
  const site = getSite();

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950 text-slate-100">
      <div className="relative z-20 mx-auto max-w-5xl px-6 py-10">
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">{site.title}</h1>
            <p className="mt-1 text-slate-400">{site.subtitle}</p>
          </div>
          <GameTabs games={games} activeId={activeId} onChange={setActiveId} />
        </header>

        <AnimatePresence mode="wait">
          <motion.main
            key={activeGame.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <HeroCard game={activeGame} />
            <KpiGrid kpis={activeGame.kpis} />
            <MatchList matches={activeGame.matches} columns={activeGame.matchColumns} />
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
