/**
 * Base Story Interface
 * Defines the minimal required fields for a story
 */
interface BaseStory {
  /** Unique identifier for the story (kebab-case) */
  id: string;
  
  /** Story title (sentence case) */
  title: string;
  
  /** Short summary (max 160 characters for SEO) */
  summary: string;
  
  /** The main content in Markdown format */
  content: string;
  
  /** Publish/creation date in YYYY-MM-DD format */
  createdAt?: string;
  
  /** Optional PDF content URL */
  pdfContent?: string;
  
  /** Optional Grok URL */
  grokUrl?: string;
  
  /** Array of category tags */
  tags?: string[];
  
  /** Story metadata */
  metadata?: StoryMetadata & {
    /** Whether the story contains React components that need special rendering */
    containsComponents?: boolean;
  };
}

/**
 * Story Metadata Type
 * Defines the structure for story metadata including SEO and display information
 */
export interface StoryMetadata {
  // Author Information
  /** Author's name */
  author?: string;
  
  /** Author's role/position */
  authorRole?: string;
  
  /** Author's avatar URL */
  authorAvatar?: string;
  
  /** Author's bio/description */
  authorBio?: string;

  // Content Metadata
  /** Publish date in YYYY-MM-DD format */
  publishedAt?: string;
  
  /** Last updated date in ISO format */
  updatedAt?: string;
  
  /** Content language code (e.g., 'en', 'fr') */
  language?: string;
  
  /** Content category */
  category?: string;
  
  /** Content difficulty level */
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  
  /** Whether the content is archived */
  archived?: boolean;
  
  /** Template identifier */
  template?: string;
  
  /** Layout identifier */
  layout?: string;
  
  // Visual Elements
  /** Cover image URL */
  coverImage?: string;
  
  /** Cover image alt text */
  coverImageAlt?: string;
  
  /** Cover image credit/attribution */
  coverImageCredit?: string;
  
  // SEO & Discoverability
  /** SEO title (if different from main title) */
  seoTitle?: string;
  
  /** SEO meta description (max 160 characters) */
  seoDescription?: string;
  
  /** SEO keywords (comma-separated) */
  seoKeywords?: string;
  
  /** Canonical URL */
  canonicalUrl?: string;
  
  /** Open Graph image URL */
  ogImage?: string;
  
  /** Twitter card type */
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  
  // Content Status & Features
  /** Whether the story is featured */
  featured?: boolean;
  
  /** Whether the story is a draft */
  draft?: boolean;
  
  /** Content version */
  version?: string;
  
  // Content Metrics
  /** Estimated reading time in minutes */
  readingTime?: number;
  
  /** Word count */
  wordCount?: number;
  
  // Relationships
  /** Related story IDs */
  relatedStories?: string[];
  
  /** External resources and references */
  references?: Array<{
    title: string;
    url: string;
    type?: string;
    author?: string;
    publishedAt?: string;
  }>;
  
  // Technical Metadata
  /** Last updated timestamp */
  lastUpdatedAt?: string;
  
  /** Content schema version */
  schemaVersion?: string;
}

/**
 * Story Content Type
 * Defines the structure for the main content of a story
 */
export interface StoryContent {
  /** The main content in Markdown format */
  content: string;
  
  /** Optional PDF content URL */
  pdfContent?: string;
  
  /** Optional Grok URL */
  grokUrl?: string;
}

/**
 * Complete Story Type
 * Combines base, metadata and content into a complete story
 */
export interface Story extends BaseStory, StoryMetadata, StoryContent {
  /** Array of category tags (required) */
  tags: string[];
  
  /** URL slug for the story */
  slug: string;
  
  /** Publish date in YYYY-MM-DD format (required) */
  publishedAt: string;
}

/**
 * Story Template Type
 * Defines the structure for story templates
 */
export interface StoryTemplate {
  /** Template ID */
  id: string;
  
  /** Template name */
  name: string;
  
  /** Template description */
  description: string;
  
  /** Default metadata */
  defaultMetadata: Partial<StoryMetadata>;
  
  /** Default content structure */
  defaultContent: string;
  
  /** Validation rules */
  validationRules?: {
    requiredFields?: (keyof StoryMetadata)[];
    maxContentLength?: number;
    allowedTags?: string[];
  };
}

/**
 * Story Category Type
 * Groups related stories together
 */
export interface StoryCategory {
  /** Category ID */
  id: string;
  
  /** Category name */
  name: string;
  
  /** Category description */
  description: string;
  
  /** Category icon */
  icon?: string;
  
  /** Story IDs in this category */
  storyIds: string[];
}
