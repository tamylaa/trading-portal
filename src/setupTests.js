import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure React Testing Library
export const testUtilsConfig = {
  defaultHidden: true, // Hide all elements as a default for `hidden: true`
};

// Apply the configuration
configure(testUtilsConfig);

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});