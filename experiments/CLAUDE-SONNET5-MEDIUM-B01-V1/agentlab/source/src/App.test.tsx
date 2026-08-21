import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the required markup contract', () => {
    render(<App />);

    expect(screen.getAllByTestId('app-shell')).toHaveLength(1);
    expect(screen.getAllByTestId('sidebar')).toHaveLength(1);
    expect(screen.getAllByTestId('stat-card')).toHaveLength(4);
    expect(screen.getAllByTestId('chart')).toHaveLength(1);
    expect(screen.getAllByTestId('projects-table')).toHaveLength(1);
    expect(screen.getAllByTestId('activity')).toHaveLength(1);
    expect(screen.getAllByTestId('quota')).toHaveLength(1);
  });

  it('has exactly one h1 and the expected landmarks', () => {
    render(<App />);

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /workspace/i })).toBeInTheDocument();
  });

  it('lists all five projects', () => {
    render(<App />);

    const table = screen.getByTestId('projects-table');
    expect(table.querySelectorAll('tbody tr')).toHaveLength(5);
  });

  it('every interactive control has an accessible name', () => {
    render(<App />);

    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveAccessibleName();
    }
    for (const link of screen.getAllByRole('link')) {
      expect(link).toHaveAccessibleName();
    }
    expect(screen.getByPlaceholderText('Search projects...')).toHaveAccessibleName();
  });
});
