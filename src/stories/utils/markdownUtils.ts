import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ExportCertificatesSection } from '../components/ExportCertificatesSection';

// Map of component names to their implementations
const COMPONENT_MAP: Record<string, React.ComponentType> = {
  'ExportCertificatesSection': ExportCertificatesSection,
};

/**
 * Processes markdown content and replaces component placeholders with actual components
 * @param content Markdown content with component placeholders
 * @returns Processed JSX content with components
 */
export function processMarkdownWithComponents(content: string): React.ReactNode {
  // Split content by component placeholders
  const parts = content.split(/(<!--\s*COMPONENT:([\w-]+)\s*-->)/g);
  
  return parts.map((part, index) => {
    // Check if this part is a component placeholder
    const match = part.match(/<!--\s*COMPONENT:([\w-]+)\s*-->/);
    if (match) {
      const componentName = match[1];
      const Component = COMPONENT_MAP[componentName];
      return Component ? React.createElement(Component, { key: `component-${index}` }) : null;
    }
    // Return regular markdown content
    return React.createElement(ReactMarkdown, { key: `markdown-${index}` }, part);
  });
}

/**
 * Checks if the content contains any component placeholders
 * @param content Markdown content to check
 * @returns True if the content contains component placeholders
 */
export function hasComponentPlaceholders(content: string): boolean {
  return /<!--\s*COMPONENT:[\w-]+\s*-->/.test(content);
}
