import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock heavy package dependencies to avoid pulling in large package graph during unit tests
jest.mock('@tamyla/content-hub', () => ({
  LoadingSpinner: (props: any) => (<span {...props}>Loading</span>)
}));

// Support both ESM/CJS interop in test env
// Require the TSX source directly to avoid shim circularity in Jest
const _src = require('../EmailBlasterTest.tsx');
const EmailBlasterTest = (_src && (_src.default || _src)) || require('../EmailBlasterTest.js');
// debug check (temporary):
// console.log('EmailBlasterTest type:', typeof EmailBlasterTest, 'name:', EmailBlasterTest && EmailBlasterTest.name);


jest.mock('../../../api/email', () => ({
  emailApi: {
    sendNotification: jest.fn()
  }
}));

import { emailApi } from '../../../api/email';

describe('EmailBlasterTest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows validation error when recipient is missing', async () => {
    render(<EmailBlasterTest />);
    fireEvent.click(screen.getByText(/Send test/i));
    expect(screen.getByRole('alert')).toHaveTextContent(/Please enter recipient/i);
  });

  it('sends notification and shows success message', async () => {
    (emailApi.sendNotification as jest.Mock).mockResolvedValue({ success: true, message: 'Sent' });

    render(<EmailBlasterTest />);

    fireEvent.change(screen.getByLabelText(/To/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText(/Send test/i));

    expect(screen.getByText(/Sending.../i)).toBeInTheDocument();

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/Sent/i));

    expect(emailApi.sendNotification).toHaveBeenCalledWith(expect.objectContaining({ to: 'test@example.com' }));
  });

  it('shows error when send fails', async () => {
    (emailApi.sendNotification as jest.Mock).mockResolvedValue({ success: false, message: 'Bad' });

    render(<EmailBlasterTest />);

    fireEvent.change(screen.getByLabelText(/To/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText(/Send test/i));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/Bad/i));
  });
});
