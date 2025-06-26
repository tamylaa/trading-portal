# FAQ Component

A reusable, accessible FAQ (Frequently Asked Questions) component with expand/collapse functionality.

## Features

- **Accessible**: Follows WAI-ARIA best practices
- **Responsive**: Works on all screen sizes
- **Customizable**: Supports custom styling via CSS classes
- **TypeScript Support**: Fully typed with TypeScript
- **Dark Mode**: Automatically adapts to system preferences

## Installation

The component is already available in the project. Import it using:

```tsx
import FAQ from '@/components/FAQ';
```

## Usage

### Basic Usage

```tsx
const faqItems = [
  {
    question: 'What is the answer to life, the universe, and everything?',
    answer: '42'
  },
  // More FAQ items...
];

<FAQ items={faqItems} />
```

### With Custom Styling

```tsx
<FAQ 
  items={faqItems} 
  className="custom-faq-class"
  style={{ maxWidth: '800px' }}
/>
```

### With Rich Content

```tsx
const faqItems = [
  {
    question: 'How do I get started?',
    answer: (
      <>
        <p>Follow these steps:</p>
        <ol>
          <li>Sign up for an account</li>
          <li>Verify your email</li>
          <li>Start using our service</li>
        </ol>
        <p>Need help? <a href="/contact">Contact support</a></p>
      </>
    )
  }
];
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `items` | `Array<{ question: string; answer: React.ReactNode }>` | Yes | Array of FAQ items with questions and answers |
| `className` | `string` | No | Additional CSS class for the FAQ container |
| `style` | `React.CSSProperties` | No | Inline styles for the FAQ container |

## Styling

The component comes with default styles that can be overridden. Use the following class names for custom styling:

- `.faq-container`: The main container
- `.faq-item`: Each FAQ item
- `.faq-question`: The clickable question/title
- `.faq-answer`: The answer content (expanded/collapsed)
- `.faq-icon`: The expand/collapse icon

## Accessibility

- Uses `button` elements for keyboard navigation
- Implements proper ARIA attributes
- Manages focus for screen readers
- Supports keyboard navigation (Enter/Space to toggle)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- IE11 (with polyfills)

## License

MIT
