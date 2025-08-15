// Enhanced Email Composer - Modular component for composing emails
// This replaces part of the large EmailBlaster.jsx functionality with focused, reusable component

import React, { useState, useCallback } from 'react';
import { EmailComposerProps } from '../index';
import styles from './EmailComposer.module.css';

export const EmailComposer: React.FC<EmailComposerProps> = ({
  onSend,
  initialContent = '',
  className = '',
  'data-testid': testId = 'email-composer',
  ...props
}) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState(initialContent);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = useCallback(async () => {
    if (!subject.trim() || !content.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSend?.({
        subject: subject.trim(),
        content: content.trim(),
        attachments,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setIsLoading(false);
    }
  }, [subject, content, attachments, onSend]);

  const handleFileAttachment = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setAttachments(prev => [...prev, ...Array.from(files)]);
    }
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const isValid = subject.trim() && content.trim();

  return (
    <div 
      className={`${styles.emailComposer} ${className}`} 
      data-testid={testId}
      {...props}
    >
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.title}>Compose Email</h3>
        <p className={styles.subtitle}>Create and send personalized emails</p>
      </div>

      {/* Subject Input */}
      <div className={styles.formSection}>
        <label htmlFor="email-subject" className={styles.sectionTitle}>
          Subject *
        </label>
        <input
          id="email-subject"
          type="text"
          placeholder="Enter email subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={styles.subjectInput}
          data-testid="email-subject-input"
        />
      </div>

      {/* Content Section */}
      <div className={styles.contentSection}>
        <h4 className={styles.sectionTitle}>
          Email Content *
        </h4>
        <div className={styles.contentEditor}>
          <textarea
            id="email-content"
            placeholder="Enter your email content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={styles.contentTextarea}
            rows={12}
            data-testid="email-content-textarea"
          />
        </div>
      </div>

      {/* Attachments */}
      <div className={styles.formSection}>
        <label htmlFor="email-attachments" className={styles.sectionTitle}>
          Attachments
        </label>
        <input
          id="email-attachments"
          type="file"
          multiple
          onChange={handleFileAttachment}
          className={styles.recipientInput}
          data-testid="email-attachments-input"
        />
        
        {attachments.length > 0 && (
          <div className={styles.recipientTags}>
            {attachments.map((file, index) => (
              <div key={`${file.name}-${index}`} className={styles.recipientTag}>
                <span>{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className={styles.tagRemove}
                  aria-label={`Remove ${file.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with actions */}
      <div className={styles.actions}>
        <div className={styles.actionGroup}>
          <span className={styles.subtitle}>
            {content.length} characters
            {attachments.length > 0 && ` • ${attachments.length} attachment${attachments.length !== 1 ? 's' : ''}`}
          </span>
        </div>
        
        <div className={styles.actionGroup}>
          <button
            type="button"
            onClick={handleSend}
            disabled={!isValid || isLoading}
            className={isLoading ? styles.loading : styles.sendButton}
            data-testid="send-email-button"
          >
            {isLoading && <span className={styles.loadingSpinner}></span>}
            {isLoading ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </div>
    </div>
  );
};
