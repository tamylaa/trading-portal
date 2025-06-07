import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './header';
import { SidebarProvider } from '../../contexts/SidebarContext';

// Mock any components or hooks that might cause side effects
jest.mock('../../contexts/AuthContext', () => ({
  __esModule: true,
  __esModule: true,
  default: () => ({
    isAuthenticated: false,
    loading: false,
    logout: jest.fn(),
  }),
}));

describe('Header Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders header component', async () => {
    render(
      <MemoryRouter>
        <SidebarProvider>
          <Header />
        </SidebarProvider>
      </MemoryRouter>
    );

    // Wait for any async operations to complete
    await waitFor(() => {
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });

  // Add more test cases as needed
});