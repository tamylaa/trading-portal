// This file is now a barrel file that re-exports all stories
// Individual stories are now managed in separate files in the 'posts' directory

import { posts } from './posts';

// Export all posts as stories for backward compatibility
export const stories = posts;

// Re-export types and utilities
export * from '@/stories/types';
export * from '@/stories/ensureStory';

// Re-export individual stories for named imports
export * from '@/stories/posts';
