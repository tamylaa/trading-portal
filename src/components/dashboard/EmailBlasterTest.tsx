import React, { useState } from 'react';
import * as ContentHub from '@tamyla/content-hub';
import { emailApi } from '../../api/email';

// Resolve LoadingSpinner safely for ESM/CJS interop and test environments
const LoadingSpinnerComponent: React.FC<any> =
  (ContentHub && (ContentHub.LoadingSpinner || (ContentHub.default && ContentHub.default.LoadingSpinner))) ||
  (() => <span aria-hidden="true">Loading...</span>);


const EmailBlasterTest: React.FC = () => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('Test Email');
  const [message, setMessage] = useState('This is a test email sent from EmailBlasterTest component.');
  const [status, setStatus] = useState<{ type: 'idle' | 'sending' | 'success' | 'error'; message?: string }>({ type: 'idle' });

  const sendTest = async () => {
    if (!to) {
      setStatus({ type: 'error', message: 'Please enter recipient email address' });
      return;
    }

    setStatus({ type: 'sending' });
    try {
      const res = await emailApi.sendNotification({ to, subject, message });
      if (res && res.success) {
        setStatus({ type: 'success', message: res.message || 'Test email sent' });
      } else {
        setStatus({ type: 'error', message: res?.message || 'Failed to send test email' });
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err?.message || 'Network error' });
    }
  };

  return (
    <div className="email-blaster-test" style={{ maxWidth: 640 }}>
      <h3>Email Blaster Test</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        <label>
          To
          <input aria-label="To" value={to} onChange={(e) => setTo(e.target.value)} placeholder="recipient@example.com" />
        </label>

        <label>
          Subject
          <input aria-label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>

        <label>
          Message
          <textarea aria-label="Message" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
        </label>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={sendTest} disabled={status.type === 'sending'}>
            {status.type === 'sending' ? 'Sending...' : 'Send test'}
          </button>
          {status.type === 'sending' && <LoadingSpinnerComponent size="sm" />}
        </div>

        {status.type === 'success' && <div role="status" style={{ color: 'green' }}>{status.message}</div>}
        {status.type === 'error' && <div role="alert" style={{ color: 'crimson' }}>{status.message}</div>}
      </div>

      <small style={{ display: 'block', marginTop: 12, color: '#666' }}>Note: This component uses the app's `emailApi` and is intended as a lightweight test harness. The production EmailBlaster service (clodo-framework) will be implemented separately.</small>
    </div>
  );
};

export default EmailBlasterTest;
