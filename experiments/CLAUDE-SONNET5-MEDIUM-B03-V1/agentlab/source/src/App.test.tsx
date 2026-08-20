import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

const SECTION_IDS = [
  'hero',
  'day-cycle',
  'features',
  'specs',
  'social-proof',
  'pricing',
  'faq',
  'footer',
];

describe('App', () => {
  it('renders all eight required sections with matching id and data-testid', () => {
    render(<App />);
    for (const id of SECTION_IDS) {
      const byTestId = screen.getByTestId(id);
      expect(byTestId).toHaveAttribute('id', id);
    }
  });

  it('renders exactly one h1 and the landmark structure', () => {
    render(<App />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /navegação principal/i })).toBeInTheDocument();
  });

  it('changes the day-cycle stage and copy when another option is selected', async () => {
    const user = userEvent.setup();
    render(<App />);
    const dayCycle = screen.getByTestId('day-cycle');
    const options = within(dayCycle).getAllByTestId('day-cycle-option');
    expect(options.length).toBeGreaterThanOrEqual(3);

    const textBefore = dayCycle.textContent;
    expect(options[0]).toHaveAttribute('aria-pressed', 'true');

    await user.click(options[2]);

    expect(options[2]).toHaveAttribute('aria-pressed', 'true');
    expect(options[0]).toHaveAttribute('aria-pressed', 'false');
    expect(dayCycle.textContent).not.toBe(textBefore);
  });

  it('expands and collapses a FAQ item on click', async () => {
    const user = userEvent.setup();
    render(<App />);
    const faq = screen.getByTestId('faq');
    const questions = within(faq).getAllByTestId('faq-question');
    expect(questions.length).toBeGreaterThanOrEqual(6);

    const second = questions[1];
    expect(second).toHaveAttribute('aria-expanded', 'false');

    await user.click(second);
    expect(second).toHaveAttribute('aria-expanded', 'true');

    await user.click(second);
    expect(second).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders at least two pricing plans and six faq items', () => {
    render(<App />);
    expect(screen.getAllByTestId('pricing-plan').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByTestId('faq-item').length).toBeGreaterThanOrEqual(6);
  });
});
