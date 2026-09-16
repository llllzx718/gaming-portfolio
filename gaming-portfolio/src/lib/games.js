import data from '../data/games.json';

export function getSite() {
  return data.site;
}

export function getGames() {
  return data.games;
}

export function getGameById(id) {
  return data.games.find((g) => g.id === id);
}

export function getDefaultGame() {
  return data.games[0];
}
