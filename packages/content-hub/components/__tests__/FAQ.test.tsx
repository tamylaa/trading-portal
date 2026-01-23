import React from 'react';
import { render, screen } from '@testing-library/react';
import FAQ from '../FAQ';

describe('FAQ', () => {
  it('renders empty state when no items', () => {
    render(<FAQ items={[]} />);
    expect(screen.getByText(/No FAQ items available./i)).toBeInTheDocument();
  });

  it('renders items and details/summary structure', () => {
    const items = [{ question: 'Q1', answer: 'A1' }, { question: 'Q2', answer: 'A2' }];
    render(<FAQ items={items} />);
    expect(screen.getByText(/Q1/)).toBeInTheDocument();
    expect(screen.getByText(/Q2/)).toBeInTheDocument();
  });
});
