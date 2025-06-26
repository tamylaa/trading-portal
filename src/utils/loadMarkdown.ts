/**
 * Loads markdown content from a URL
 * @param url URL to the markdown file
 * @returns Promise that resolves to the markdown content
 */
export async function loadMarkdownContent(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load markdown from ${url}: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading markdown:', error);
    return `# Error Loading Content\n\nUnable to load the requested content.`;
  }
}

/**
 * Loads multiple markdown files and combines them
 * @param urls Array of markdown file URLs
 * @returns Promise that resolves to the combined markdown content
 */
export async function loadMarkdownFiles(urls: string[]): Promise<string> {
  try {
    const contents = await Promise.all(
      urls.map(url => loadMarkdownContent(url))
    );
    return contents.join('\n\n');
  } catch (error) {
    console.error('Error loading markdown files:', error);
    return `# Error Loading Content\n\nUnable to load the requested content.`;
  }
}
