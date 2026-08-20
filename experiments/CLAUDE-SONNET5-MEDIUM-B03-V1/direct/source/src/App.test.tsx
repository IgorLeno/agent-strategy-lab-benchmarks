import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  it('renders exactly one h1 and all eight required sections', () => {
    render(<App />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);

    const ids = [
      'hero',
      'day-cycle',
      'features',
      'specs',
      'social-proof',
      'pricing',
      'faq',
      'footer',
    ];
    for (const id of ids) {
      const byId = document.getElementById(id);
      const byTestId = screen.getByTestId(id);
      expect(byId).toBe(byTestId);
    }
  });

  it('has header, main and footer landmarks with nav inside header', () => {
    render(<App />);
    expect(document.querySelector('header')).toBeTruthy();
    expect(document.querySelector('main')).toBeTruthy();
    expect(document.querySelector('footer')).toBeTruthy();
    expect(document.querySelector('header nav')).toBeTruthy();
  });

  it('changes the day-cycle stage and copy when a different moment is selected', async () => {
    const user = userEvent.setup();
    render(<App />);

    const options = screen.getAllByTestId('day-cycle-option');
    expect(options.length).toBeGreaterThanOrEqual(3);

    const stage = screen.getByTestId('day-cycle-stage');
    const before = stage.getAttribute('data-moment');

    await user.click(options[options.length - 1]);

    const after = stage.getAttribute('data-moment');
    expect(after).not.toBe(before);
    expect(options[options.length - 1]).toHaveAttribute('aria-pressed', 'true');
  });

  it('opens and closes an FAQ item, toggling aria-expanded', async () => {
    const user = userEvent.setup();
    render(<App />);

    const questions = screen.getAllByTestId('faq-question');
    expect(questions.length).toBeGreaterThanOrEqual(6);

    const first = questions[0];
    expect(first).toHaveAttribute('aria-expanded', 'false');

    await user.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'true');

    await user.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders at least two pricing plans and six FAQ items', () => {
    render(<App />);
    expect(screen.getAllByTestId('pricing-plan').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByTestId('faq-item').length).toBeGreaterThanOrEqual(6);
  });

  it('renders nav links pointing at in-page anchors', () => {
    render(<App />);
    const nav = document.querySelector('header nav') as HTMLElement;
    const link = within(nav).getByRole('link', { name: /day cycle/i });
    expect(link.getAttribute('href')).toBe('#day-cycle');
  });
});
