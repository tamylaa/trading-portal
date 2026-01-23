import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarProvider, useSidebar } from '../SidebarContext';

const Test = () => {
  const { isOpen, toggleSidebar } = useSidebar();
  return (
    <div>
      <div data-testid="state">{isOpen ? 'open' : 'closed'}</div>
      <button onClick={toggleSidebar}>toggle</button>
    </div>
  );
};

describe('SidebarContext', () => {
  it('toggles sidebar open/closed', () => {
    render(
      <SidebarProvider>
        <Test />
      </SidebarProvider>
    );

    expect(screen.getByTestId('state').textContent).toBe('open');
    fireEvent.click(screen.getByText('toggle'));
    expect(screen.getByTestId('state').textContent).toBe('closed');
  });
});
