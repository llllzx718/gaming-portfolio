import { useState } from 'react';
import { getGames } from '../lib/games';

export function useActiveGame() {
  const games = getGames();
  const [activeId, setActiveId] = useState(games[0]?.id ?? null);
  const activeGame = games.find((g) => g.id === activeId) ?? games[0];
  return { games, activeGame, activeId, setActiveId };
}
