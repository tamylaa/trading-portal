# Stories

This directory contains all the blog posts and articles for the trading portal. Each story is a self-contained module with its own metadata and content.

## Structure

```
stories/
├── posts/                  # Individual story files
│   ├── spices-export-guide.ts
│   ├── github-cloudflare.ts
│   └── index.ts             # Exports all posts
├── templates/              # Story templates
│   └── default.ts          # Default story template
├── ensureStory.ts          # Helper function for type safety
├── stories.ts              # Main export (backward compatible)
└── types.ts                # Type definitions
```

## Adding a New Story

1. **Create a new file** in the `posts` directory (e.g., `my-new-story.ts`)
2. **Use the template** from `@/stories/templates/default`
3. **Export** your story using `ensureStory`
4. **Add** it to `posts/index.ts`

Example:

```typescript
import { ensureStory } from '@/stories/ensureStory';
import { defaultTemplate } from '@/stories/templates/default';

export const myNewStory = ensureStory({
  ...defaultTemplate,
  id: 'my-new-story',
  title: 'My New Story',
  summary: 'A brief summary of my new story',
  content: `# My New Story
  
  Content goes here...`,
  tags: ['tag1', 'tag2'],
  createdAt: '2025-06-05',
  slug: 'my-new-story'
});
```

## Best Practices

- Keep story content in Markdown format
- Use semantic HTML in Markdown when needed
- Add relevant tags for categorization
- Include a clear summary (max 2-3 sentences)
- Set appropriate creation and publication dates

## Available Utilities

- `ensureStory`: Ensures story objects match the expected format
- `defaultTemplate`: Provides default values for common story fields

## Types

See `types.ts` for complete type definitions.
