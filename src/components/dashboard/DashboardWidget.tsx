import React from 'react';
import './DashboardWidget.css';

interface DashboardWidgetProps {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * DashboardWidget - A scalable, reusable shell for dashboard widgets and legacy components.
 * - Applies consistent card style, padding, background, and section header.
 * - Supports optional title and actions (e.g., buttons, menus).
 * - Use to wrap any component for instant dashboard look & feel.
 */
const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  actions,
  children,
  className = '',
  style = {}
}) => {
  return (
    <section className={`dashboard-widget ${className}`.trim()} style={style}>
      {(title || actions) && (
        <div className="dashboard-widget-header">
          {title && <h2 className="dashboard-widget-title">{title}</h2>}
          {actions && <div className="dashboard-widget-actions">{actions}</div>}
        </div>
      )}
      <div className="dashboard-widget-content">
        {children}
      </div>
    </section>
  );
};

export default DashboardWidget;
