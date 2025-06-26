// This utility helps load markdown content in a way that's compatible with TypeScript and ESLint

// Define the type for our markdown content
type MarkdownContent = {
  [key: string]: string;
};

// This will be populated at runtime with the markdown content
const markdownContent: MarkdownContent = {};

// Function to load markdown content
export const loadMarkdown = (key: string, content: string): void => {
  markdownContent[key] = content;
};

// Function to get markdown content
export const getMarkdown = (key: string): string => {
  const content = markdownContent[key];
  if (!content) {
    console.warn(`Markdown content not found for key: ${key}`);
    return '';
  }
  return content;
};

// Function to load all markdown files for a specific post
export const loadPostContent = (postName: string, contentMap: Record<string, string>): void => {
  Object.entries(contentMap).forEach(([key, content]) => {
    loadMarkdown(`${postName}:${key}`, content);
  });
};

// Function to get all markdown content for a post
export const getPostContent = (postName: string, sectionOrder: string[]): string => {
  return sectionOrder
    .map(section => getMarkdown(`${postName}:${section}`))
    .filter(Boolean)
    .join('\n\n');
};
