// Enhanced EmailBlaster Container - Modular replacement for large EmailBlaster.jsx
// Uses composition of smaller components while maintaining same API

import React, { useState, useCallback } from 'react';
import { EmailComposer } from './EmailComposer';
import { EnhancedEmailBlasterProps } from '../index';
import styles from './EnhancedEmailBlaster.module.css';

export const EnhancedEmailBlaster: React.FC<EnhancedEmailBlasterProps> = ({
  onClose,
  onSuccess,
  onError,
  mode = 'compose',
  initialData,
  className = '',
  'data-testid': testId = 'enhanced-email-blaster',
  ...props
}) => {
  const [activeMode, setActiveMode] = useState(mode);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSend = useCallback(async (emailData: any) => {
    setIsLoading(true);
    try {
      // Use existing email API to maintain compatibility
      const { emailApi } = require('../../../api/email');
      
      const result = await emailApi.sendEmail({
        subject: emailData.subject,
        message: emailData.content,
        attachments: emailData.attachments || [],
        timestamp: emailData.timestamp
      });
      
      if (result.success) {
        onSuccess?.(result);
        // Optionally close after successful send
        // onClose?.();
      } else {
        onError?.(new Error(result.error || 'Failed to send email'));
      }
    } catch (error) {
      console.error('Enhanced EmailBlaster send error:', error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  const handleClose = useCallback(() => {
    if (isLoading) {
      return; // Prevent closing while sending
    }
    onClose?.();
  }, [onClose, isLoading]);

  return (
    <div 
      className={`${styles.container} ${className}`}
      data-testid={testId}
      {...props}
    >
      {/* Header with close button */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>Email Campaign</h2>
          <p className={styles.subtitle}>Enhanced email composition with better UX</p>
        </div>
        
        <button 
          onClick={handleClose}
          disabled={isLoading}
          className={styles.closeButton}
          aria-label="Close email composer"
          data-testid="close-email-blaster"
        >
          ×
        </button>
      </div>

      {/* Navigation tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeMode === 'compose' ? styles.tabActive : ''}`}
          onClick={() => setActiveMode('compose')}
          disabled={isLoading}
          data-testid="compose-tab"
        >
          Compose
        </button>
        
        <button 
          className={`${styles.tab} ${activeMode === 'templates' ? styles.tabActive : ''}`}
          onClick={() => setActiveMode('templates')}
          disabled={isLoading}
          data-testid="templates-tab"
        >
          Templates
        </button>
        
        <button 
          className={`${styles.tab} ${activeMode === 'campaigns' ? styles.tabActive : ''}`}
          onClick={() => setActiveMode('campaigns')}
          disabled={isLoading}
          data-testid="campaigns-tab"
        >
          Campaigns
        </button>
        
        <button 
          className={`${styles.tab} ${activeMode === 'contacts' ? styles.tabActive : ''}`}
          onClick={() => setActiveMode('contacts')}
          disabled={isLoading}
          data-testid="contacts-tab"
        >
          Contacts
        </button>
      </div>

      {/* Content area */}
      <div className={styles.content}>
        {activeMode === 'compose' && (
          <EmailComposer 
            onSend={handleEmailSend}
            initialContent={initialData?.content || ''}
            data-testid="email-composer-content"
          />
        )}
        
        {activeMode === 'templates' && (
          <div className={styles.placeholder} data-testid="templates-content">
            <h3>Email Templates</h3>
            <p>Template management will be implemented in the next iteration.</p>
            <p>This maintains the same tab structure as the original EmailBlaster.</p>
          </div>
        )}
        
        {activeMode === 'campaigns' && (
          <div className={styles.placeholder} data-testid="campaigns-content">
            <h3>Campaign Management</h3>
            <p>Campaign features will be implemented in the next iteration.</p>
            <p>All existing campaign functionality is preserved in the original EmailBlaster.</p>
          </div>
        )}
        
        {activeMode === 'contacts' && (
          <div className={styles.placeholder} data-testid="contacts-content">
            <h3>Contact Management</h3>
            <p>Contact management will be implemented in the next iteration.</p>
            <p>All existing contact functionality is preserved in the original EmailBlaster.</p>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className={styles.loadingOverlay} data-testid="loading-overlay">
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <p>Sending email...</p>
          </div>
        </div>
      )}
    </div>
  );
};
