import { describe, it, expect } from 'vitest';
import { getSite, getGames, getGameById, getDefaultGame } from './games';

describe('games data', () => {
  it('exposes site meta', () => {
    expect(getSite().title).toBeTruthy();
    expect(getSite().accent).toMatch(/^#/);
  });

  it('has the three expected games', () => {
    const ids = getGames().map((g) => g.id);
    expect(ids).toEqual(expect.arrayContaining(['delta-force', 'valorant', 'hok']));
  });

  it('resolves a game by id', () => {
    expect(getGameById('valorant')?.name).toBe('无畏契约');
    expect(getGameById('nope')).toBeUndefined();
  });

  it('defaults to the first game', () => {
    expect(getDefaultGame().id).toBe(getGames()[0].id);
  });

  it('every game has kpis, matchColumns and highlights', () => {
    for (const g of getGames()) {
      expect(g.kpis.length).toBeGreaterThan(0);
      expect(g.matchColumns.length).toBeGreaterThan(0);
      expect(g.highlights.length).toBeGreaterThan(0);
    }
  });
});
