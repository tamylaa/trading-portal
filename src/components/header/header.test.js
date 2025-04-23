import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './header';
import { SidebarProvider } from '../../contexts/SidebarContext';

describe('Header Component', () => {
  test('renders header component', () => {
    render(
      <MemoryRouter>
        <SidebarProvider>
          <Header />
        </SidebarProvider>
      </MemoryRouter>
    );
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});