import { Story } from './types';
import { hasComponentPlaceholders } from './utils/markdownUtils';

/**
 * Ensures a story object conforms to the Story interface
 * @param story Partial story object with required fields
 * @returns A complete Story object with defaults for optional fields
 */
export function ensureStory(story: Partial<Story> & { 
  id: string; 
  title: string; 
  summary: string; 
  content: string 
}): Story {
  const now = new Date().toISOString().split('T')[0];
  
  // Check if the content contains any component placeholders
  const containsComponents = hasComponentPlaceholders(story.content);
  
  const metadata = {
    ...(story as any).metadata,
    containsComponents,
  };

  return {
    ...story,
    // Ensure required fields have defaults
    tags: story.tags || [],
    slug: story.slug || story.id,
    publishedAt: story.publishedAt || (story as any).createdAt || now,
    // Ensure createdAt is set for backward compatibility
    createdAt: (story as any).createdAt || story.publishedAt || now,
    // Add metadata
    metadata,
    // Ensure all required fields are present
    title: story.title,
    summary: story.summary,
    content: story.content,
    id: story.id
  } as Story;
}
