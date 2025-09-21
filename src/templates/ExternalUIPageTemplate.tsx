// src/templates/ExternalUIPageTemplate.tsx
/**
 * EXTERNAL UI PAGE TEMPLATE - For pages using external UI packages
 *
 * Use this template when integrating external UI libraries like:
 * - @tamyla/ui-components-react
 * - Material-UI
 * - Ant Design
 * - etc.
 */

import React from 'react';
import PageLayout from '../components/common/PageLayout';
// Import external UI components
// import { ExternalComponent } from 'external-ui-package';

const ExternalUIPageTemplate: React.FC = () => {
  return (
    <PageLayout
      title="External UI Page"
      subtitle="Page using external UI components"
    >
      <div className="external-ui-wrapper">
        {/* Always wrap external components in external-ui-wrapper */}
        {/*
        <ExternalComponent
          // External component props
          theme="auto"
          onEvent={handleEvent}
        />
        */}

        {/* Placeholder for development */}
        <div style={{
          padding: '2rem',
          border: '2px dashed #ccc',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#666'
        }}>
          <h3>External UI Component</h3>
          <p>Replace this placeholder with your external UI component</p>
          <p>Remember to wrap it in &lt;div className="external-ui-wrapper"&gt;</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default ExternalUIPageTemplate;
