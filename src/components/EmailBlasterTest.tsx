// Test component to validate our enhanced EmailBlaster implementation
// This can be imported and used in any existing component for testing

import React, { useState } from 'react';
import { ProgressiveEmailBlaster } from './ProgressiveEmailBlaster';
import { FEATURE_FLAGS, setFeatureFlag } from '../config/features';

// Enhanced state management imports (feature-flag protected)
// import { useEnhancedTradingPreferences, useEnhancedDisplayPreferences } from '../store/enhanced';

// Optional: Import types for better type safety
// import type { AuthUser } from '../contexts/AuthContext.types';

export const EmailBlasterTest: React.FC = () => {
  const [showBlaster, setShowBlaster] = useState(false);
  const [useEnhanced, setUseEnhanced] = useState(FEATURE_FLAGS.useEnhancedEmailBlaster);
  const [useEnhancedState, setUseEnhancedState] = useState(FEATURE_FLAGS.useEnhancedStateManagement);

  const handleToggleEnhanced = () => {
    const newValue = !useEnhanced;
    setUseEnhanced(newValue);
    setFeatureFlag('useEnhancedEmailBlaster', newValue);
    setFeatureFlag('useEnhancedComponents', newValue);
  };

  const handleToggleEnhancedState = () => {
    const newValue = !useEnhancedState;
    setUseEnhancedState(newValue);
    setFeatureFlag('useEnhancedStateManagement', newValue);
    setFeatureFlag('useEnhancedState', newValue);
  };

  const handleSuccess = (result: any) => {
    console.log('Email sent successfully:', result);
    alert('Email sent successfully!');
    setShowBlaster(false);
  };

  const handleError = (error: any) => {
    console.error('Email send error:', error);
    alert('Failed to send email: ' + (error.message || error));
  };

  const handleClose = () => {
    setShowBlaster(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Email Blaster Test Component</h2>
      
      {/* Feature Toggle */}
      <div style={{ marginBottom: '20px', padding: '16px', background: '#f6f8fa', borderRadius: '8px' }}>
        <h3>Feature Configuration</h3>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <input
            type="checkbox"
            checked={useEnhanced}
            onChange={handleToggleEnhanced}
          />
          Use Enhanced EmailBlaster Components
        </label>
        <p style={{ fontSize: '14px', color: '#666', margin: '0 0 16px 24px' }}>
          {useEnhanced 
            ? '✅ Enhanced version enabled - New modular components with better UX' 
            : '⚡ Legacy version enabled - Original EmailBlaster.jsx (safe fallback)'
          }
        </p>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={useEnhancedState}
            onChange={handleToggleEnhancedState}
          />
          Use Enhanced State Management
        </label>
        <p style={{ fontSize: '14px', color: '#666', margin: '0 0 0 24px' }}>
          {useEnhancedState 
            ? '🚀 Enhanced state management enabled - Modular Redux slices with better performance' 
            : '📦 Legacy state management - Original large slices (backward compatible)'
          }
        </p>
      </div>

      {/* Test Buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowBlaster(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#0969da',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Open Email Blaster
        </button>
        
        <button
          onClick={() => {
            console.log('Current feature flags:', FEATURE_FLAGS);
            alert(JSON.stringify(FEATURE_FLAGS, null, 2));
          }}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Show Feature Flags
        </button>
      </div>

      {/* Current Status */}
      <div style={{ marginBottom: '20px', padding: '16px', background: '#e6f7ff', borderRadius: '8px' }}>
        <h4>Current Status</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          <div>
            <h5 style={{ margin: '0 0 8px 0', color: '#0969da' }}>Component Features</h5>
            <ul style={{ margin: '0', paddingLeft: '20px' }}>
              <li>Enhanced Components: {FEATURE_FLAGS.useEnhancedComponents ? '✅ Enabled' : '❌ Disabled'}</li>
              <li>Enhanced EmailBlaster: {FEATURE_FLAGS.useEnhancedEmailBlaster ? '✅ Enabled' : '❌ Disabled'}</li>
              <li>Design System: {FEATURE_FLAGS.useDesignSystem ? '✅ Enabled' : '❌ Disabled'}</li>
            </ul>
          </div>
          <div>
            <h5 style={{ margin: '0 0 8px 0', color: '#8250df' }}>State Management</h5>
            <ul style={{ margin: '0', paddingLeft: '20px' }}>
              <li>Enhanced State: {FEATURE_FLAGS.useEnhancedStateManagement ? '✅ Enabled' : '❌ Disabled'}</li>
              <li>Modular Preferences: {FEATURE_FLAGS.useComposedPreferences ? '✅ Enabled' : '❌ Disabled'}</li>
              <li>Enhanced Dashboard State: {FEATURE_FLAGS.useModularDashboardState ? '✅ Enabled' : '❌ Disabled'}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* EmailBlaster Modal */}
      {showBlaster && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '100%',
            maxHeight: '100%',
            overflow: 'auto'
          }}>
            <ProgressiveEmailBlaster
              onClose={handleClose}
              onSuccess={handleSuccess}
              onError={handleError}
              useLegacyMode={!useEnhanced}
            />
          </div>
        </div>
      )}
    </div>
  );
};
