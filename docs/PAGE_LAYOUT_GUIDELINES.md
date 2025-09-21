# Page Layout Guidelines

## Overview

All pages in the trading-portal application must use the `PageLayout` component to ensure consistent viewport, layout, alignment, and responsiveness across the application.

## Why PageLayout?

- **Consistency**: Ensures all pages follow the same layout patterns
- **Responsiveness**: Built-in responsive behavior that works with MainLayout
- **Maintainability**: Centralized layout logic prevents duplication
- **External UI Integration**: Properly handles external UI packages like `ui-components-react`

## Usage

### Basic Usage

```tsx
import PageLayout from '../components/common/PageLayout';

const MyPage = () => {
  return (
    <PageLayout title="Page Title" subtitle="Optional subtitle">
      <YourPageContent />
    </PageLayout>
  );
};
```

### With External UI Packages

```tsx
import PageLayout from '../components/common/PageLayout';
import { ExternalComponent } from 'external-ui-package';

const MyPage = () => {
  return (
    <PageLayout>
      <div className="external-ui-wrapper">
        <ExternalComponent />
      </div>
    </PageLayout>
  );
};
```

### Without Header

```tsx
const MyPage = () => {
  return (
    <PageLayout showHeader={false}>
      <CustomHeader />
      <PageContent />
    </PageLayout>
  );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Page content (required) |
| `className` | `string` | `''` | Additional CSS classes |
| `title` | `string` | - | Page title (shows in header) |
| `subtitle` | `string` | - | Page subtitle (shows in header) |
| `showHeader` | `boolean` | `true` | Whether to show the default header |

## CSS Classes

### Page Structure
- `.page-layout` - Main container with consistent spacing
- `.page-header` - Header section with title/subtitle
- `.page-content` - Main content area
- `.external-ui-wrapper` - Special wrapper for external UI components

### Responsive Behavior
- Automatically adjusts padding and spacing on mobile devices
- Works with MainLayout's sidebar states
- Maintains consistent container widths

## For External UI Packages

When integrating external UI packages:

1. **Always wrap in PageLayout** - This ensures consistent layout
2. **Use external-ui-wrapper class** - Handles overflow and sizing issues
3. **Test responsiveness** - Ensure the external component works on all screen sizes
4. **Check for conflicts** - Some packages may override layout styles

### Example with ui-components-react

```tsx
import { SearchInterface } from '@tamyla/ui-components-react';

const SearchPage = () => {
  return (
    <PageLayout title="Search" subtitle="Find what you need">
      <div className="external-ui-wrapper">
        <SearchInterface
          placeholder="Search..."
          onSearch={handleSearch}
        />
      </div>
    </PageLayout>
  );
};
```

## Development Guidelines

### ✅ Do's
- Always use PageLayout for new pages
- Test on multiple screen sizes
- Use design system tokens for custom styling
- Wrap external components appropriately

### ❌ Don'ts
- Create custom page layouts
- Override PageLayout styles directly
- Forget to handle external UI package integration
- Skip responsive testing

## Migration Guide

### Existing Pages
Update existing pages to use PageLayout:

```tsx
// Before
const MyPage = () => (
  <div className="custom-layout">
    <h1>Title</h1>
    <Content />
  </div>
);

// After
const MyPage = () => (
  <PageLayout title="Title">
    <Content />
  </PageLayout>
);
```

### Component Templates

Use these templates when creating new pages:

### Basic Page Template
```bash
cp src/templates/PageTemplate.tsx src/pages/YourNewPage.tsx
```

### External UI Page Template
```bash
cp src/templates/ExternalUIPageTemplate.tsx src/pages/YourExternalUIPage.tsx
```

The templates include:
- Proper PageLayout usage
- External UI wrapper patterns
- TypeScript interfaces
- Placeholder comments for customization

## Troubleshooting

### Layout Issues
- Check that PageLayout is the outermost component
- Ensure no conflicting CSS is overriding layout styles
- Verify MainLayout integration

### External UI Problems
- Use `.external-ui-wrapper` class
- Check for CSS conflicts with external stylesheets
- Test component isolation

### Responsive Issues
- PageLayout handles most responsive behavior
- Test on actual devices, not just browser dev tools
- Check MainLayout sidebar interactions
