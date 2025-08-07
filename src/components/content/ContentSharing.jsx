import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { emailApi } from '../../api/email';
import { contentApi } from '../../api/content';
import './ContentSharing.css';

/**
 * ContentSharing Component
 * 
 * Enables users to share files via email with public links
 * Integrates with content service for file management and email service for delivery
 */
export function ContentSharing({ 
  selectedFiles = [], 
  onClose, 
  onSuccess,
  onError 
}) {
  const { currentUser, token } = useAuth();
  const [recipients, setRecipients] = useState(['']);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [makePublic, setMakePublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [publicLinks, setPublicLinks] = useState({});
  const [emailPreview, setEmailPreview] = useState('');

  // Auto-generate subject if files are selected
  useEffect(() => {
    if (selectedFiles.length > 0 && !subject) {
      const fileNames = selectedFiles.slice(0, 3).map(f => f.name).join(', ');
      const suffix = selectedFiles.length > 3 ? ` and ${selectedFiles.length - 3} more` : '';
      setSubject(`Shared Files: ${fileNames}${suffix}`);
    }
  }, [selectedFiles, subject]);

  // Generate email preview when message or files change
  useEffect(() => {
    generateEmailPreview();
  }, [message, selectedFiles, publicLinks]);

  const addRecipient = () => {
    setRecipients([...recipients, '']);
  };

  const removeRecipient = (index) => {
    const newRecipients = recipients.filter((_, i) => i !== index);
    setRecipients(newRecipients.length > 0 ? newRecipients : ['']);
  };

  const updateRecipient = (index, value) => {
    const newRecipients = [...recipients];
    newRecipients[index] = value;
    setRecipients(newRecipients);
  };

  const toggleFilePublic = async (file) => {
    if (!token) return;

    setLoading(true);
    try {
      const result = await contentApi.toggleFilePublic(file.id, true);
      
      if (result.success) {
        setPublicLinks(prev => ({
          ...prev,
          [file.id]: `https://content.tamyla.com/access/${file.id}`
        }));
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error making file public:', error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const makeAllFilesPublic = async () => {
    if (!makePublic || !token) return;

    setLoading(true);
    try {
      const fileIds = selectedFiles.map(f => f.id);
      const result = await contentApi.makeFilesPublic(fileIds);
      
      if (result.success) {
        const links = {};
        fileIds.forEach(fileId => {
          links[fileId] = `https://content.tamyla.com/access/${fileId}`;
        });
        setPublicLinks(links);
      } else {
        throw new Error('Failed to make files public');
      }
    } catch (error) {
      console.error('Error making files public:', error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const generateEmailPreview = () => {
    const fileList = selectedFiles.map(file => {
      const link = publicLinks[file.id] || `https://content.tamyla.com/access/${file.id}`;
      return `• ${file.name} - ${link}`;
    }).join('\n');

    const preview = `
${message}

${selectedFiles.length > 0 ? `Shared Files:\n${fileList}` : ''}

--
Shared via Tamyla Trading Portal
${currentUser?.name || currentUser?.email}
    `.trim();

    setEmailPreview(preview);
  };

  const sendEmails = async () => {
    const validRecipients = recipients.filter(email => email.trim() && email.includes('@'));
    
    if (validRecipients.length === 0) {
      onError?.(new Error('Please add at least one valid email address'));
      return;
    }

    if (!subject.trim()) {
      onError?.(new Error('Please add a subject'));
      return;
    }

    setLoading(true);
    try {
      // Make files public if requested
      if (makePublic && selectedFiles.length > 0) {
        await makeAllFilesPublic();
      }

      // Send emails to all recipients
      const emailPromises = validRecipients.map(email => 
        emailApi.sendContentShare({
          to: email.trim(),
          subject: subject,
          message: message,
          files: selectedFiles.map(file => ({
            name: file.name,
            url: publicLinks[file.id] || `https://content.tamyla.com/access/${file.id}`,
            size: file.size,
            type: file.type
          })),
          senderName: currentUser?.name || currentUser?.email,
          senderEmail: currentUser?.email
        })
      );

      const results = await Promise.allSettled(emailPromises);
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.length - successful;

      if (successful > 0) {
        onSuccess?.({
          message: `Successfully sent to ${successful} recipient(s)${failed > 0 ? `, ${failed} failed` : ''}`,
          recipients: successful,
          failed: failed
        });
      } else {
        throw new Error('All emails failed to send');
      }

    } catch (error) {
      console.error('Error sending emails:', error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-sharing-modal">
      <div className="content-sharing-container">
        <div className="content-sharing-header">
          <h3>Share Files via Email</h3>
          <button className="close-button" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="content-sharing-body">
          {/* File Selection Summary */}
          {selectedFiles.length > 0 && (
            <div className="selected-files-summary">
              <h4>Selected Files ({selectedFiles.length})</h4>
              <div className="file-list">
                {selectedFiles.map((file, index) => (
                  <div key={file.id || index} className="file-item">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                    {makePublic && (
                      <span className="public-status">
                        {publicLinks[file.id] ? '🌐 Public' : '🔒 Private'}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="public-toggle">
                <label>
                  <input
                    type="checkbox"
                    checked={makePublic}
                    onChange={(e) => setMakePublic(e.target.checked)}
                  />
                  Make files publicly accessible (recommended for email sharing)
                </label>
              </div>
            </div>
          )}

          {/* Recipients */}
          <div className="recipients-section">
            <h4>Recipients</h4>
            {recipients.map((recipient, index) => (
              <div key={index} className="recipient-input-group">
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={recipient}
                  onChange={(e) => updateRecipient(index, e.target.value)}
                  className="recipient-input"
                />
                {recipients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRecipient(index)}
                    className="remove-recipient-btn"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addRecipient}
              className="add-recipient-btn"
            >
              + Add Recipient
            </button>
          </div>

          {/* Email Content */}
          <div className="email-content-section">
            <div className="form-group">
              <label htmlFor="email-subject">Subject</label>
              <input
                id="email-subject"
                type="text"
                placeholder="Email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="subject-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email-message">Message</label>
              <textarea
                id="email-message"
                placeholder="Add a personal message (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="message-input"
                rows={4}
              />
            </div>
          </div>

          {/* Email Preview */}
          <div className="email-preview-section">
            <h4>Email Preview</h4>
            <div className="email-preview">
              <pre>{emailPreview}</pre>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="content-sharing-footer">
          <button
            type="button"
            onClick={onClose}
            className="cancel-btn"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={sendEmails}
            className="send-btn"
            disabled={loading || recipients.filter(r => r.trim()).length === 0}
          >
            {loading ? 'Sending...' : `Send to ${recipients.filter(r => r.trim()).length} recipient(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContentSharing;
