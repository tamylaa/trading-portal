// src/templates/PageTemplate.tsx
/**
 * PAGE TEMPLATE - Copy this template for new pages
 *
 * This template ensures all pages follow consistent layout patterns.
 * Replace the placeholders with your specific page content.
 *
 * Usage:
 * 1. Copy this file to src/pages/YourNewPage.tsx
 * 2. Replace placeholders with your content
 * 3. Update imports as needed
 * 4. Add to App.tsx routing
 */

import React from 'react';
import PageLayout from '../components/common/PageLayout';
// Import your specific components here
// import YourComponent from '../components/YourComponent';

interface PageTemplateProps {
  // Add any props your page needs
  // example: userId?: string;
}

const PageTemplate: React.FC<PageTemplateProps> = ({
  // Destructure props here
  // userId
}) => {
  // Add your page logic here
  // const [state, setState] = useState(initialState);

  return (
    <PageLayout
      title="Page Title" // Replace with your page title
      subtitle="Optional page description" // Replace or remove
    >
      {/* Page content goes here */}
      <div className="page-content-wrapper">
        {/* Replace with your actual content */}
        <p>Your page content here</p>

        {/* Example of external UI package integration */}
        {/*
        <div className="external-ui-wrapper">
          <ExternalComponent
            prop1="value1"
            onAction={handleAction}
          />
        </div>
        */}
      </div>
    </PageLayout>
  );
};

export default PageTemplate;
