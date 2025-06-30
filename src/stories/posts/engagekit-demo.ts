import { ensureStory } from '@/stories/ensureStory';
import { defaultTemplate } from '@/stories/templates/default';

const content = `# EngageKit Demo

This page demonstrates the EngageKit modules in action. EngageKit provides interactive engagement tools to enhance user experience on your blog or content-heavy pages.

## Reading Progress

As you scroll through this article, you'll see a progress bar at the top of the page. This is the Reading Progress module, which helps users track their reading progress through long-form content.

## Text Highlighter

Try selecting any text in this article. A small toolbar will appear allowing you to highlight the selected text in different colors. This is the Highlighter module, which enables users to highlight and save important information from your content.

## How It Works

EngageKit is designed to be easy to integrate into any website. Simply add the EngageKit script to your page and initialize it with your account ID:

\`\`\`html
<script src="https://cdn.yourdomain.com/engagekit.min.js" data-account="YOUR_ACCOUNT_ID"></script>
\`\`\`

## Features

### Reading Progress
- Tracks reading progress with a customizable progress bar
- Shows progress percentage (optional)
- Configurable position (top or bottom)
- Customizable colors and styles

### Text Highlighter
- Highlight text in multiple colors
- Save highlights (requires backend integration)
- Share highlighted content
- Customizable highlight colors

## Getting Started

1. Sign up for an EngageKit account
2. Get your account ID
3. Add the EngageKit script to your website
4. Customize the modules through the EngageKit dashboard

## Configuration

You can configure EngageKit by passing options when initializing:

\`\`\`javascript
window.EngageKit.init({
  accountId: 'YOUR_ACCOUNT_ID',
  debug: true,
  modules: {
    'reading-progress': {
      enabled: true,
      position: 'top',
      color: '#4285f4',
      showPercentage: true
    },
    'highlighter': {
      enabled: true,
      colors: ['#ffeb3b', '#4caf50', '#2196f3', '#9c27b0']
    }
  }
});
\`\`\`

## Next Steps

- [Sign up for EngageKit](#)
- [View documentation](#)
- [Contact support](#)
`;

// Define the story with proper typing
const engagekitDemo: {
  id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  slug: string;
  publishedAt: string;
  createdAt: string;
  grokUrl?: string;
  pdfContent?: string;
  metadata: {
    author: string;
    authorRole: string;
    authorAvatar: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    template: string;
    coverImage: string;
    coverImageAlt: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    ogImage: string;
    readingTime: number;
    wordCount: number;
    featured: boolean;
    draft: boolean;
    containsComponents?: boolean;
  };
} = {
  // BaseStory fields
  id: 'engagekit-demo',
  title: 'EngageKit Demo',
  summary: 'Interactive content engagement tools for your blog or content-heavy pages',
  content,
  
  // Required Story fields
  tags: ['engagekit', 'demo', 'interactive', 'engagement'],
  slug: 'engagekit-demo',
  publishedAt: '2025-06-29',
  
  // Optional fields that might be accessed
  createdAt: '2025-06-29',
  
  // Metadata with proper typing
  metadata: {
    author: 'EngageKit Team',
    authorRole: 'Development Team',
    authorAvatar: '/images/avatars/engagekit-team.jpg',
    category: 'Tutorial',
    difficulty: 'beginner',
    template: 'default',
    coverImage: '/images/engagekit-demo.jpg',
    coverImageAlt: 'EngageKit Demo',
    seoTitle: 'EngageKit Demo | Interactive Content Engagement Tools',
    seoDescription: 'See EngageKit in action with our interactive demo. Experience reading progress tracking and text highlighting features.',
    seoKeywords: 'engagekit, content engagement, reading progress, text highlighter, interactive content',
    ogImage: '/images/engagekit-demo-og.jpg',
    readingTime: 5,
    wordCount: 1200,
    featured: true,
    draft: false,
    containsComponents: true // Indicate this story contains React components
  }
};

export { engagekitDemo };

// Ensure the story is properly registered
ensureStory(engagekitDemo);

export default engagekitDemo;
