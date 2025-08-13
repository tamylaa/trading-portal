import React, { useState } from 'react';
import { ContentManager, ContentSharing, EmailBlaster } from '../components/content';
import { useAuth } from '../contexts/AuthContext';
import './ContentSharingDemo.css';

/**
 * Content Sharing Demo Page
 * 
 * Demonstrates the enhanced content management capabilities
 * including file sharing via email and bulk campaign features
 */
function ContentSharingDemo() {
  const { currentUser } = useAuth();
  const [notification, setNotification] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleContentUploaded = (uploadResult) => {
    setNotification({
      type: 'success',
      message: `File "${uploadResult.file.name}" uploaded successfully!`
    });
  };

  const handleContentShared = (shareResult) => {
    setNotification({
      type: 'success',
      message: shareResult.message
    });
  };

  const handleCampaignSent = (campaignResult) => {
    setNotification({
      type: 'success',
      message: campaignResult.message
    });
  };

  const handleError = (error) => {
    setNotification({
      type: 'error',
      message: error.message || 'An error occurred'
    });
  };

  const handleSelectionChanged = (selectionData) => {
    setSelectedFiles(selectionData.selectedFiles || []);
  };

  // Auto-hide notification
  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="content-sharing-demo">
      <div className="demo-header">
        <h1>Content Management & Sharing</h1>
        <p>
          Upload, manage, and share files with your trading network. 
          Send individual files or create comprehensive email campaigns with attachments.
        </p>
      </div>

      {/* Global Notification */}
      {notification && (
        <div className={`demo-notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>×</button>
        </div>
      )}

      {/* Feature Overview */}
      <div className="feature-overview">
        <div className="feature-card">
          <h3>📁 File Management</h3>
          <ul>
            <li>Secure file upload with JWT authentication</li>
            <li>Public/private file controls</li>
            <li>Multiple access patterns (authenticated, signed URLs, public)</li>
            <li>File listing and organization</li>
          </ul>
        </div>
        
        <div className="feature-card">
          <h3>📧 Content Sharing</h3>
          <ul>
            <li>Share selected files via email</li>
            <li>Auto-generate public links for easy access</li>
            <li>Personal messages with file attachments</li>
            <li>Multiple recipients support</li>
          </ul>
        </div>
        
        <div className="feature-card">
          <h3>📢 Email Campaigns</h3>
          <ul>
            <li>Bulk email campaigns with file attachments</li>
            <li>Contact list management</li>
            <li>Template-based emails</li>
            <li>Campaign scheduling and tracking</li>
          </ul>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedFiles.length > 0 && (
        <div className="selection-summary">
          <h3>Selected Files ({selectedFiles.length})</h3>
          <div className="selected-files-grid">
            {selectedFiles.map((file, index) => (
              <div key={file.id || index} className="selected-file-card">
                <div className="file-icon">📄</div>
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-size">
                    {file.size ? (file.size / (1024 * 1024)).toFixed(2) + ' MB' : 'Unknown size'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Content Manager */}
      <div className="demo-section">
        <h2>Enhanced Content Manager</h2>
        <p>
          The enhanced content manager includes sharing capabilities and email campaign tools.
          Select files and use the sharing buttons that appear above the file gallery.
        </p>
        
        <ContentManager
          apiBase="https://content.tamyla.com"
          selectionMode={true}
          showUpload={true}
          showGallery={true}
          showSearch={true}
          showSharing={true}
          showEmailBlaster={true}
          onContentUploaded={handleContentUploaded}
          onContentShared={handleContentShared}
          onCampaignSent={handleCampaignSent}
          onSelectionChanged={handleSelectionChanged}
          onError={handleError}
          className="demo-content-manager"
        />
      </div>

      {/* Integration Guide */}
      <div className="integration-guide">
        <h2>Integration Guide</h2>
        
        <div className="code-example">
          <h3>Basic Usage</h3>
          <pre>{`import { ContentManager } from '../components/content';

<ContentManager
  selectionMode={true}
  showSharing={true}
  showEmailBlaster={true}
  onContentShared={(result) => console.log('Content shared:', result)}
  onCampaignSent={(result) => console.log('Campaign sent:', result)}
/>`}</pre>
        </div>

        <div className="code-example">
          <h3>Standalone Components</h3>
          <pre>{`import { ContentSharing, EmailBlaster } from '../components/content';

// Content sharing with selected files
<ContentSharing
  selectedFiles={[{id: 'file1', name: 'document.pdf'}]}
  onSuccess={(result) => console.log('Shared:', result)}
  onClose={() => setShowSharing(false)}
/>

// Email campaign manager
<EmailBlaster
  onSuccess={(result) => console.log('Campaign sent:', result)}
  onClose={() => setShowCampaigns(false)}
/>`}</pre>
        </div>

        <div className="api-endpoints">
          <h3>API Integration</h3>
          <div className="endpoint-list">
            <div className="endpoint">
              <strong>Content Service:</strong> https://content.tamyla.com
              <ul>
                <li>POST /upload - Upload files</li>
                <li>GET /files - List user files</li>
                <li>GET /public - List public files</li>
                <li>PUT /access/&#123;id&#125;/public - Toggle public status</li>
              </ul>
            </div>
            <div className="endpoint">
              <strong>Email Service:</strong> https://email.tamyla.com
              <ul>
                <li>POST /send/content-share - Send file sharing emails</li>
                <li>POST /send/bulk-campaign - Send bulk campaigns</li>
                <li>GET /templates - Get email templates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* User Context */}
      {currentUser && (
        <div className="user-context">
          <h3>Current User Context</h3>
          <div className="user-info">
            <p><strong>Name:</strong> {currentUser.name || 'Not provided'}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Role:</strong> {currentUser.role || 'User'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContentSharingDemo;
