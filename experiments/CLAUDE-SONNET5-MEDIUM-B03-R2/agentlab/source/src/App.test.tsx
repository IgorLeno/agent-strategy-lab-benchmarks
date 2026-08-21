import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('LUMA landing page', () => {
  it('renders exactly one h1 and all eight required sections', () => {
    render(<App />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);

    const ids = ['hero', 'day-cycle', 'features', 'specs', 'social-proof', 'pricing', 'faq', 'footer'];
    for (const id of ids) {
      const byId = document.getElementById(id);
      expect(byId).not.toBeNull();
      expect(byId).toBe(screen.getByTestId(id));
    }
  });

  it('changes the day-cycle stage and copy when another moment is selected', async () => {
    const user = userEvent.setup();
    render(<App />);

    const options = screen.getAllByTestId('day-cycle-option');
    expect(options.length).toBeGreaterThanOrEqual(3);

    const stage = screen.getByTestId('day-cycle-stage');
    const before = stage.getAttribute('style');

    await user.click(options[options.length - 1]);

    expect(stage.getAttribute('style')).not.toBe(before);
    expect(options[options.length - 1]).toHaveAttribute('aria-pressed', 'true');
  });

  it('expands a FAQ answer when its question is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const questions = screen.getAllByTestId('faq-question');
    expect(questions.length).toBeGreaterThanOrEqual(6);

    const second = questions[1];
    expect(second).toHaveAttribute('aria-expanded', 'false');

    await user.click(second);
    expect(second).toHaveAttribute('aria-expanded', 'true');
  });
});
