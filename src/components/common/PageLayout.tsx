// src/components/common/PageLayout.tsx
import React from 'react';
import './PageLayout.css';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
}

/**
 * PageLayout - Consistent layout wrapper for all pages
 *
 * Ensures consistent viewport, spacing, and responsive behavior across the application.
 * All pages should use this component to maintain design consistency.
 *
 * Usage:
 * ```tsx
 * <PageLayout title="Dashboard" subtitle="Welcome back">
 *   <YourPageContent />
 * </PageLayout>
 * ```
 *
 * For pages with external UI packages:
 * ```tsx
 * <PageLayout>
 *   <ExternalUIComponent />
 * </PageLayout>
 * ```
 */
const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className = '',
  title,
  subtitle,
  showHeader = true
}) => {
  return (
    <div className={`page-layout ${className}`}>
      {showHeader && (title || subtitle) && (
        <header className="page-header">
          {title && <h1 className="page-title">{title}</h1>}
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </header>
      )}
      <main className="page-content">
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
