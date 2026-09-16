import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameTabs from './GameTabs';
import { getGames } from '../lib/games';

describe('GameTabs', () => {
  it('renders a tab per game', () => {
    render(<GameTabs games={getGames()} activeId="valorant" onChange={() => {}} />);
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('calls onChange with the clicked game id', async () => {
    const onChange = vi.fn();
    render(<GameTabs games={getGames()} activeId="valorant" onChange={onChange} />);
    await userEvent.click(screen.getByRole('tab', { name: '三角洲行动' }));
    expect(onChange).toHaveBeenCalledWith('delta-force');
  });
});
