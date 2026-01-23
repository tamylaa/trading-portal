import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Header from './header';
import { SidebarProvider } from '../../contexts/SidebarContext';

export default {
  title: 'Header',
  component: Header,
};

export const Default = () => (
  <MemoryRouter>
    <SidebarProvider>
      <Header />
    </SidebarProvider>
  </MemoryRouter>
);
