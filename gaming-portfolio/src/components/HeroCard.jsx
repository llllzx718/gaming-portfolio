import { getIcon } from '../lib/icons';

export default function HeroCard({ game }) {
  const Icon = getIcon(game.icon);
  return (
    <div
      data-elastic-card
      data-elastic-id="hero"
      data-image={game.cover}
      data-color1={game.accent}
      data-color2="#05060f"
      data-radius="20"
      data-tilt="10"
      data-resolution="20"
      className="relative h-64 overflow-hidden rounded-3xl"
    >
      <div className="relative z-10 flex h-full flex-col justify-end p-6">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-slate-300">
          <Icon className="h-3.5 w-3.5" />
          {game.tagline}
        </span>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">{game.name}</h2>
      </div>
    </div>
  );
}
