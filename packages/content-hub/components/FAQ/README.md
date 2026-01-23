# FAQ Component

A reusable, accessible FAQ (Frequently Asked Questions) component with expand/collapse functionality.

## Features

- **Accessible**: Follows WAI-ARIA best practices
- **Responsive**: Works on all screen sizes
- **Customizable**: Supports custom styling via CSS classes
- **TypeScript Support**: Fully typed with TypeScript
- **Dark Mode**: Automatically adapts to system preferences

## Installation

The component is available from the content-hub package:

```tsx
import { FAQ } from '@tamyla/content-hub';
```

## Usage

### Basic Usage

```tsx
import React from 'react';
import { FAQ } from '@tamyla/content-hub';

const faqData = [
  {
    question: "What is this service?",
    answer: "This is a comprehensive trading platform designed to help you maximize your export profits."
  },
  {
    question: "How do I get started?",
    answer: "Simply sign up for an account and follow our onboarding process."
  }
];

const MyComponent = () => {
  return (
    <div>
      <h2>Frequently Asked Questions</h2>
      <FAQ items={faqData} />
    </div>
  );
};
```

### Advanced Usage with Custom Styling

```tsx
import React from 'react';
import { FAQ } from '@tamyla/content-hub';

const advancedFaqData = [
  {
    question: "Can I customize the appearance?",
    answer: (
      <div>
        <p>Yes! You can customize the FAQ component in several ways:</p>
        <ul>
          <li>Add custom CSS classes</li>
          <li>Override the default styles</li>
          <li>Use dark mode support</li>
        </ul>
      </div>
    )
  }
];

const MyCustomFAQ = () => {
  return (
    <FAQ 
      items={advancedFaqData} 
      className="my-custom-faq"
    />
  );
};
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `items` | `FAQItem[]` | Yes | Array of FAQ items with question and answer |
| `className` | `string` | No | Additional CSS class for custom styling |

### FAQItem Type

```typescript
type FAQItem = {
  question: string;
  answer: React.ReactNode;
};
```

## Styling

The component comes with default styling that includes:
- Clean, modern appearance
- Smooth animations
- Hover effects
- Focus indicators for accessibility
- Dark mode support

You can override the default styles by:

1. Adding a custom `className` prop
2. Overriding CSS custom properties
3. Creating your own CSS file that targets the component classes

## Accessibility

The FAQ component follows accessibility best practices:

- **ARIA attributes**: Proper use of `aria-expanded`, `aria-controls`, and `role` attributes
- **Keyboard navigation**: Fully navigable with keyboard
- **Screen reader support**: Descriptive labels and relationships
- **Focus management**: Clear focus indicators

## Browser Support

This component works in all modern browsers that support:
- ES6+ JavaScript features
- CSS Grid and Flexbox
- CSS custom properties
- CSS transitions

## Migration from src/components

If you were previously using the FAQ component from `src/components/FAQ`, update your imports:

```tsx
// Old import
import FAQ from '@/components/FAQ';

// New import
import { FAQ } from '@tamyla/content-hub';
```