import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MatchList from './MatchList';

const columns = [
  { key: 'date', label: '日期' },
  { key: 'map', label: '地图' },
  { key: 'result', label: '结果' },
];
const matches = [
  { date: '2026-09-15', map: '源工重镇', result: 'win', details: [{ label: '评分', value: 'MVP' }] },
  { date: '2026-09-14', map: '裂变峡谷', result: 'loss' },
];

describe('MatchList', () => {
  it('renders column headers', () => {
    render(<MatchList matches={matches} columns={columns} />);
    expect(screen.getByText('日期')).toBeInTheDocument();
    expect(screen.getByText('地图')).toBeInTheDocument();
  });

  it('renders one row per match', () => {
    render(<MatchList matches={matches} columns={columns} />);
    expect(screen.getAllByTestId('match-row')).toHaveLength(2);
  });

  it('renders result as a badge', () => {
    render(<MatchList matches={matches} columns={columns} />);
    expect(screen.getByText('胜')).toBeInTheDocument();
    expect(screen.getByText('负')).toBeInTheDocument();
  });

  it('expands and collapses match details on click', async () => {
    render(<MatchList matches={matches} columns={columns} />);
    const row = screen.getAllByTestId('match-row')[0];
    expect(screen.queryByText('评分')).not.toBeInTheDocument();

    fireEvent.click(row);
    expect(screen.getByText('评分')).toBeInTheDocument();
    expect(screen.getByText('MVP')).toBeInTheDocument();

    fireEvent.click(row);
    await waitFor(() => expect(screen.queryByText('评分')).not.toBeInTheDocument());
  });
});
