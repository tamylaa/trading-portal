import { StoryTemplate, StoryMetadata } from '@/stories/types';

/**
 * Default Story Template
 * Provides a consistent structure and default values for all stories.
 * This template ensures consistency across all stories while allowing for customization.
 */
export const defaultTemplate: StoryTemplate = {
  // Core identification
  id: 'default',
  name: 'Default Story Template',
  description: 'Standard template for all stories with common metadata and structure',
  
  // Default metadata values
  defaultMetadata: {
    // Author information
    author: 'Tamyla Team',
    authorRole: 'Trading Experts',
    authorAvatar: '/images/authors/tamyla-avatar.png',
    authorBio: 'Experts in international trade and export documentation',
    
    // Content metadata
    readingTime: 5,
    wordCount: 0,
    language: 'en',
    
    // SEO and discoverability
    seoTitle: '',
    seoDescription: '',
    seoKeywords: 'trading, export, india, business',
    canonicalUrl: '',
    
    // Content classification
    category: 'general',
    difficulty: 'beginner', // beginner, intermediate, advanced
    
    // Content status
    featured: false,
    draft: true,
    archived: false,
    
    // Visual elements
    coverImage: '/images/stories/default-cover.jpg',
    coverImageAlt: 'Default story cover image',
    coverImageCredit: 'Tamyla',
    
    // Social sharing
    ogImage: '/images/og/default-og-image.jpg',
    twitterCard: 'summary_large_image',
    
    // Related content
    relatedStories: [],
    
    // Technical
    template: 'default',
    layout: 'standard',
    
    // Content updates
    lastUpdatedAt: new Date().toISOString(),
    version: '1.0.0',
  },
  
  // Default content structure in Markdown
  defaultContent: `# [Story Title]

> A compelling one-liner that summarizes the key takeaway

![Cover Image Alt Text](/images/stories/default-cover.jpg)
*<small>Image credit: [Photographer Name](https://example.com)</small>*

## Introduction
[Provide a brief introduction to the topic. Explain why this topic matters and what readers will learn.]

## Table of Contents
- [Key Takeaways](#key-takeaways)
- [Prerequisites](#prerequisites)
- [Section 1](#section-1)
- [Section 2](#section-2)
- [Section 3](#section-3)
- [Common Pitfalls to Avoid](#common-pitfalls)
- [Conclusion](#conclusion)
- [Further Reading](#further-reading)

## Key Takeaways {#key-takeaways}
- Key point 1
- Key point 2
- Key point 3

## Prerequisites {#prerequisites}
- Basic understanding of [related topic]
- [Tool/Resource] installed
- [Other requirements]

## Section 1 {#section-1}
[Content for section 1]

### Subsection 1.1
- Bullet point
- Another point

## Section 2 {#section-2}
[Content for section 2]

## Section 3 {#section-3}
[Content for section 3]

## Common Pitfalls to Avoid {#common-pitfalls}
- Common mistake 1 and how to avoid it
- Common mistake 2 and how to avoid it

## Conclusion {#conclusion}
[Summarize key points and provide a clear conclusion]

## Further Reading {#further-reading}
- [Title](https://example.com) - Description
- [Title](https://example.com) - Description

## References
- [Reference 1](https://example.com)
- [Reference 2](https://example.com)

## About the Author
[Brief author bio with relevant credentials and links to their profile]

## Changelog
- **2025-06-05**: Initial publication
`,

  validationRules: {
    requiredFields: ['title', 'summary', 'publishedAt'] as Array<keyof StoryMetadata>,
    maxContentLength: 50000,
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'a', 'ul', 'ol', 'li', 'blockquote',
      'strong', 'em', 'code', 'pre', 'hr', 'br',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'img', 'figure', 'figcaption'
    ],
  },
};

export default defaultTemplate;
