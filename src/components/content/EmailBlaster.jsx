import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
import { emailApi } from '../../api/email';
import ContentSharing from './ContentSharing';
import './EmailBlaster.css';

/**
 * EmailBlaster Component
 * 
 * Advanced bulk email component for sending campaigns with file attachments
 * Includes contact list management, templates, and campaign tracking
 */
export function EmailBlaster({ onClose, onSuccess, onError }) {
  // Removed unused currentUser, token to fix ESLint error
  const [activeTab, setActiveTab] = useState('compose');
  const [campaigns, setCampaigns] = useState([]);
  const [contactLists, setContactLists] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Campaign compose state
  const [campaign, setCampaign] = useState({
    name: '',
    subject: '',
    template: '',
    message: '',
    selectedLists: [],
    attachedFiles: [],
    scheduledFor: null,
    isImmediate: true
  });

  // Contact management state
  const [newContact, setNewContact] = useState({ email: '', name: '', lists: [] });
  const [importContacts, setImportContacts] = useState('');
  const [showContentSharing, setShowContentSharing] = useState(false);

  useEffect(() => {
    loadTemplates();
    loadContactLists();
    loadCampaigns();
  }, []);

  const loadTemplates = async () => {
    try {
      const result = await emailApi.getTemplates();
      if (result.success) {
        setTemplates(result.templates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadContactLists = async () => {
    // Mock contact lists - replace with actual API call
    setContactLists([
      { id: 'traders', name: 'Active Traders', count: 245 },
      { id: 'investors', name: 'Investors', count: 156 },
      { id: 'newsletter', name: 'Newsletter Subscribers', count: 1024 },
      { id: 'vip', name: 'VIP Clients', count: 42 }
    ]);
  };

  const loadCampaigns = async () => {
    // Mock campaigns - replace with actual API call
    setCampaigns([
      {
        id: 1,
        name: 'Q1 Market Report',
        subject: 'Q1 2025 Market Analysis',
        status: 'sent',
        sentAt: '2025-01-15T10:00:00Z',
        recipients: 245,
        opens: 189,
        clicks: 67
      },
      {
        id: 2,
        name: 'Weekly Newsletter',
        subject: 'Weekly Trading Insights',
        status: 'scheduled',
        scheduledFor: '2025-01-20T09:00:00Z',
        recipients: 1024
      }
    ]);
  };

  const addContact = async () => {
    if (!newContact.email) return;

    setLoading(true);
    try {
      // Mock API call - replace with actual implementation
      console.log('Adding contact:', newContact);
      setNewContact({ email: '', name: '', lists: [] });
      await loadContactLists(); // Refresh lists
    } catch (error) {
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const importContactsFromText = async () => {
    const emails = importContacts
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.includes('@'));

    if (emails.length === 0) {
      onError?.(new Error('No valid email addresses found'));
      return;
    }

    setLoading(true);
    try {
      // Mock API call - replace with actual implementation
      console.log('Importing contacts:', emails);
      setImportContacts('');
      await loadContactLists(); // Refresh lists
      onSuccess?.({ message: `Imported ${emails.length} contacts` });
    } catch (error) {
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const selectFiles = () => {
    setShowContentSharing(true);
  };

  const handleFilesSelected = (files) => {
    setCampaign(prev => ({
      ...prev,
      attachedFiles: [...prev.attachedFiles, ...files]
    }));
    setShowContentSharing(false);
  };

  const removeAttachedFile = (fileId) => {
    setCampaign(prev => ({
      ...prev,
      attachedFiles: prev.attachedFiles.filter(f => f.id !== fileId)
    }));
  };

  const sendCampaign = async () => {
    if (!campaign.name || !campaign.subject || campaign.selectedLists.length === 0) {
      onError?.(new Error('Please fill in campaign name, subject, and select at least one contact list'));
      return;
    }

    setLoading(true);
    try {
      // Calculate total recipients
      const totalRecipients = campaign.selectedLists.reduce((total, listId) => {
        const list = contactLists.find(l => l.id === listId);
        return total + (list?.count || 0);
      }, 0);

      // Mock API call - replace with actual implementation
      console.log('Sending campaign:', {
        ...campaign,
        totalRecipients,
        attachments: campaign.attachedFiles.map(f => f.id)
      });

      onSuccess?.({
        message: `Campaign "${campaign.name}" ${campaign.isImmediate ? 'sent' : 'scheduled'} to ${totalRecipients} recipients`
      });

      // Reset form
      setCampaign({
        name: '',
        subject: '',
        template: '',
        message: '',
        selectedLists: [],
        attachedFiles: [],
        scheduledFor: null,
        isImmediate: true
      });

      await loadCampaigns(); // Refresh campaigns
    } catch (error) {
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const renderComposeTab = () => (
    <div className="compose-campaign">
      <div className="campaign-form">
        <div className="form-row">
          <div className="form-group">
            <label>Campaign Name</label>
            <input
              type="text"
              value={campaign.name}
              onChange={(e) => setCampaign(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Internal name for this campaign"
            />
          </div>
          <div className="form-group">
            <label>Email Subject</label>
            <input
              type="text"
              value={campaign.subject}
              onChange={(e) => setCampaign(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Email subject line"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Template (Optional)</label>
          <select
            value={campaign.template}
            onChange={(e) => setCampaign(prev => ({ ...prev, template: e.target.value }))}
          >
            <option value="">Custom Message</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Message</label>
          <textarea
            value={campaign.message}
            onChange={(e) => setCampaign(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Email content..."
            rows={8}
          />
        </div>

        <div className="form-group">
          <label>Contact Lists</label>
          <div className="contact-lists-selection">
            {contactLists.map(list => (
              <label key={list.id} className="list-checkbox">
                <input
                  type="checkbox"
                  checked={campaign.selectedLists.includes(list.id)}
                  onChange={(e) => {
                    const newLists = e.target.checked
                      ? [...campaign.selectedLists, list.id]
                      : campaign.selectedLists.filter(id => id !== list.id);
                    setCampaign(prev => ({ ...prev, selectedLists: newLists }));
                  }}
                />
                <span>{list.name} ({list.count} contacts)</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>File Attachments</label>
          <div className="file-attachments">
            {campaign.attachedFiles.map(file => (
              <div key={file.id} className="attached-file">
                <span>{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachedFile(file.id)}
                  className="remove-file-btn"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={selectFiles}
              className="select-files-btn"
            >
              + Add Files
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Delivery</label>
          <div className="delivery-options">
            <label className="delivery-option">
              <input
                type="radio"
                checked={campaign.isImmediate}
                onChange={() => setCampaign(prev => ({ ...prev, isImmediate: true }))}
              />
              <span>Send Immediately</span>
            </label>
            <label className="delivery-option">
              <input
                type="radio"
                checked={!campaign.isImmediate}
                onChange={() => setCampaign(prev => ({ ...prev, isImmediate: false }))}
              />
              <span>Schedule for Later</span>
            </label>
            {!campaign.isImmediate && (
              <input
                type="datetime-local"
                value={campaign.scheduledFor || ''}
                onChange={(e) => setCampaign(prev => ({ ...prev, scheduledFor: e.target.value }))}
                className="schedule-input"
              />
            )}
          </div>
        </div>

        <div className="campaign-summary">
          <h4>Campaign Summary</h4>
          <p>Recipients: {campaign.selectedLists.reduce((total, listId) => {
            const list = contactLists.find(l => l.id === listId);
            return total + (list?.count || 0);
          }, 0)} contacts</p>
          <p>Attachments: {campaign.attachedFiles.length} files</p>
          <p>Delivery: {campaign.isImmediate ? 'Immediate' : `Scheduled for ${campaign.scheduledFor}`}</p>
        </div>

        <button
          type="button"
          onClick={sendCampaign}
          disabled={loading || !campaign.name || !campaign.subject || campaign.selectedLists.length === 0}
          className="send-campaign-btn"
        >
          {loading ? 'Processing...' : campaign.isImmediate ? 'Send Campaign' : 'Schedule Campaign'}
        </button>
      </div>
    </div>
  );

  const renderContactsTab = () => (
    <div className="contacts-management">
      <div className="contacts-section">
        <h4>Add Single Contact</h4>
        <div className="add-contact-form">
          <input
            type="email"
            placeholder="Email address"
            value={newContact.email}
            onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Name (optional)"
            value={newContact.name}
            onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
          />
          <button onClick={addContact} disabled={loading || !newContact.email}>
            Add Contact
          </button>
        </div>
      </div>

      <div className="contacts-section">
        <h4>Import Multiple Contacts</h4>
        <textarea
          placeholder="Paste email addresses (one per line)..."
          value={importContacts}
          onChange={(e) => setImportContacts(e.target.value)}
          rows={6}
          className="import-textarea"
        />
        <button
          onClick={importContactsFromText}
          disabled={loading || !importContacts.trim()}
          className="import-btn"
        >
          Import Contacts
        </button>
      </div>

      <div className="contacts-section">
        <h4>Contact Lists</h4>
        <div className="contact-lists">
          {contactLists.map(list => (
            <div key={list.id} className="contact-list-item">
              <span className="list-name">{list.name}</span>
              <span className="list-count">{list.count} contacts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCampaignsTab = () => (
    <div className="campaigns-history">
      <h4>Campaign History</h4>
      <div className="campaigns-list">
        {campaigns.map(campaign => (
          <div key={campaign.id} className="campaign-item">
            <div className="campaign-header">
              <h5>{campaign.name}</h5>
              <span className={`status ${campaign.status}`}>{campaign.status}</span>
            </div>
            <p className="campaign-subject">{campaign.subject}</p>
            <div className="campaign-stats">
              <span>Recipients: {campaign.recipients}</span>
              {campaign.status === 'sent' && (
                <>
                  <span>Opens: {campaign.opens}</span>
                  <span>Clicks: {campaign.clicks}</span>
                </>
              )}
              {campaign.status === 'scheduled' && (
                <span>Scheduled: {new Date(campaign.scheduledFor).toLocaleString()}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="email-blaster-modal">
      <div className="email-blaster-container">
        <div className="email-blaster-header">
          <h3>Email Campaign Manager</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="email-blaster-tabs">
          <button
            className={`tab ${activeTab === 'compose' ? 'active' : ''}`}
            onClick={() => setActiveTab('compose')}
          >
            Compose
          </button>
          <button
            className={`tab ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            Contacts
          </button>
          <button
            className={`tab ${activeTab === 'campaigns' ? 'active' : ''}`}
            onClick={() => setActiveTab('campaigns')}
          >
            Campaigns
          </button>
        </div>

        <div className="email-blaster-body">
          {activeTab === 'compose' && renderComposeTab()}
          {activeTab === 'contacts' && renderContactsTab()}
          {activeTab === 'campaigns' && renderCampaignsTab()}
        </div>
      </div>

      {showContentSharing && (
        <ContentSharing
          onClose={() => setShowContentSharing(false)}
          onSuccess={handleFilesSelected}
          onError={onError}
        />
      )}
    </div>
  );
}

export default EmailBlaster;
