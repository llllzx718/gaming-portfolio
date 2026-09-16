import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import KpiGrid from './KpiGrid';

const kpis = [
  { label: '段位', value: '钻石 1', icon: 'trophy' },
  { label: '胜率', value: '54.2%', icon: 'percent' },
];

describe('KpiGrid', () => {
  it('renders each kpi label and value', () => {
    render(<KpiGrid kpis={kpis} />);
    expect(screen.getByText('段位')).toBeInTheDocument();
    expect(screen.getByText('钻石 1')).toBeInTheDocument();
    expect(screen.getByText('胜率')).toBeInTheDocument();
    expect(screen.getByText('54.2%')).toBeInTheDocument();
  });

  it('marks cards for the elastic canvas', () => {
    const { container } = render(<KpiGrid kpis={kpis} />);
    expect(container.querySelectorAll('[data-elastic-card]')).toHaveLength(2);
  });
});
