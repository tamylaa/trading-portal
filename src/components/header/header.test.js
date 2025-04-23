import { render, screen } from '@testing-library/react';
import Header from './header';

describe('Header Component', () => {
  test('renders header component', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});