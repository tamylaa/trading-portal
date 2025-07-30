// src/components/dashboard/EmailServicesWidget.jsx
import React, { useState, useEffect } from 'react';
import { emailApi } from '../../api/email';
import { useAuth } from '../../contexts/AuthContext';
import './EmailServicesWidget.css';

const EmailServicesWidget = () => {
  const { currentUser } = useAuth();
  const [emailServiceStatus, setEmailServiceStatus] = useState('checking');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkEmailServiceHealth();
  }, []);

  const checkEmailServiceHealth = async () => {
    try {
      // Skip health check in development to avoid CSP violation
      if (process.env.NODE_ENV === 'development') {
        console.log('Skipping email service health check in development to avoid CSP violation');
        setEmailServiceStatus('bypassed');
        return;
      }
      
      const healthCheck = await emailApi.checkHealth();
      setEmailServiceStatus(healthCheck.success ? 'healthy' : 'error');
    } catch (error) {
      console.warn('Email service health check failed:', error);
      setEmailServiceStatus('error');
    }
  };

  const sendWelcomeEmail = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const result = await emailApi.sendNotification({
        to: currentUser.email,
        subject: 'Welcome to Tamyla Trading Portal',
        template: 'welcome',
        data: {
          name: currentUser.name,
          company: currentUser.profile?.company || 'Your Company'
        }
      });

      if (result.success) {
        setMessage('Welcome email sent successfully!');
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'welcome',
          status: 'sent',
          timestamp: new Date().toISOString()
        }]);
      } else {
        setMessage(`Failed to send welcome email: ${result.message}`);
      }
    } catch (error) {
      setMessage('Failed to send welcome email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendCompanyProfileEmail = async () => {
    if (!currentUser.profile?.company) {
      setMessage('Please complete your company profile first.');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const result = await emailApi.sendNotification({
        to: currentUser.email,
        subject: 'Your Company Profile - Tamyla Trading Portal',
        template: 'company-profile',
        data: {
          name: currentUser.name,
          email: currentUser.email,
          company: currentUser.profile.company,
          position: currentUser.profile.position || 'Not specified',
          phone: currentUser.profile.phone || 'Not provided'
        }
      });

      if (result.success) {
        setMessage('Company profile email sent successfully!');
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'company-profile',
          status: 'sent',
          timestamp: new Date().toISOString()
        }]);
      } else {
        setMessage(`Failed to send company profile: ${result.message}`);
      }
    } catch (error) {
      setMessage('Failed to send company profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNewsletter = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const result = await emailApi.subscribeNewsletter({
        email: currentUser.email,
        name: currentUser.name,
        lists: ['trading-updates', 'industry-news']
      });

      if (result.success) {
        setMessage('Successfully subscribed to newsletter!');
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'newsletter',
          status: 'subscribed',
          timestamp: new Date().toISOString()
        }]);
      } else {
        setMessage(`Failed to subscribe: ${result.message}`);
      }
    } catch (error) {
      setMessage('Failed to subscribe to newsletter. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-services-widget">
      <div className="widget-header">
        <h3>Email Services</h3>
        <div className={`service-status ${emailServiceStatus}`}>
          <span className="status-indicator"></span>
          {emailServiceStatus === 'healthy' && 'Online'}
          {emailServiceStatus === 'error' && 'Offline'}
          {emailServiceStatus === 'checking' && 'Checking...'}
          {emailServiceStatus === 'bypassed' && 'Development Mode'}
        </div>
      </div>

      {(emailServiceStatus === 'healthy' || emailServiceStatus === 'bypassed') && (
        <div className="email-actions">
          <div className="action-group">
            <h4>Quick Actions</h4>
            <div className="action-buttons">
              <button 
                onClick={sendWelcomeEmail}
                disabled={loading}
                className="action-btn primary"
              >
                {loading ? 'Sending...' : 'Send Welcome Email'}
              </button>
              
              <button 
                onClick={sendCompanyProfileEmail}
                disabled={loading || !currentUser.profile?.company}
                className="action-btn secondary"
                title={!currentUser.profile?.company ? 'Complete your company profile first' : ''}
              >
                {loading ? 'Sending...' : 'Email Company Profile'}
              </button>
              
              <button 
                onClick={subscribeToNewsletter}
                disabled={loading}
                className="action-btn tertiary"
              >
                {loading ? 'Subscribing...' : 'Subscribe to Newsletter'}
              </button>
            </div>
          </div>

          {message && (
            <div className={`message ${message.includes('success') || message.includes('Successfully') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          {notifications.length > 0 && (
            <div className="notifications-section">
              <h4>Recent Email Activity</h4>
              <div className="notifications-list">
                {notifications.slice(-3).reverse().map(notification => (
                  <div key={notification.id} className="notification-item">
                    <div className="notification-content">
                      <span className="notification-type">
                        {notification.type === 'welcome' && '📧 Welcome Email'}
                        {notification.type === 'company-profile' && '🏢 Company Profile'}
                        {notification.type === 'newsletter' && '📰 Newsletter'}
                      </span>
                      <span className="notification-status">
                        {notification.status === 'sent' && 'Sent'}
                        {notification.status === 'subscribed' && 'Subscribed'}
                      </span>
                    </div>
                    <div className="notification-time">
                      {new Date(notification.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {emailServiceStatus === 'error' && (
        <div className="service-offline">
          <p>Email services are currently unavailable.</p>
          <button onClick={checkEmailServiceHealth} className="retry-btn">
            Retry Connection
          </button>
        </div>
      )}
    </div>
  );
};

export default EmailServicesWidget;
