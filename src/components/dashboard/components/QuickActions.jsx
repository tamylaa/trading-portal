// Quick Actions - Immediate Value & Engagement
import React from 'react';
import './QuickActions.css';

const QuickActions = ({ onAction }) => {
  const actions = [
    {
      id: 'content',
      title: 'Upload Content',
      description: 'Add new files to your library',
      icon: '📎',
      color: '#667eea',
      reward: '+10 XP'
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      description: 'Check your performance',
      icon: '📊',
      color: '#764ba2',
      reward: '+5 XP'
    },
    {
      id: 'overview',
      title: 'Daily Summary',
      description: 'See your dashboard overview',
      icon: '📋',
      color: '#f093fb',
      reward: '+3 XP'
    },
    {
      id: 'achievements',
      title: 'View Achievements',
      description: 'Check your milestones',
      icon: '🏆',
      color: '#f5576c',
      reward: '+2 XP'
    }
  ];

  return (
    <div className="quick-actions">
      <h3 className="quick-actions-title">Quick Actions</h3>
      <div className="actions-grid">
        {actions.map((action) => (
          <button
            key={action.id}
            className="action-button"
            onClick={() => onAction(action.id)}
            style={{ '--color': action.color }}
          >
            <div className="action-content">
              <span className="action-icon">{action.icon}</span>
              <div className="action-info">
                <h4 className="action-title">{action.title}</h4>
                <p className="action-description">{action.description}</p>
              </div>
              <span className="action-reward">{action.reward}</span>
            </div>
            <div className="action-glow"></div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
