import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { loadMarkdownContent } from '@/utils/loadMarkdown';

interface MarkdownContentProps {
  /**
   * The URL of the markdown file to load
   */
  url: string;
  
  /**
   * Optional class name for the container
   */
  className?: string;
  
  /**
   * Optional callback when content is loaded
   */
  onLoad?: () => void;
  
  /**
   * Optional callback when an error occurs
   */
  onError?: (error: Error) => void;
}

/**
 * A component that loads and renders markdown content from a URL
 */
export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  url,
  className = '',
  onLoad,
  onError,
}) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true);
        const markdown = await loadMarkdownContent(url);
        setContent(markdown);
        setError(null);
        onLoad?.();
      } catch (err) {
        console.error(`Error loading markdown from ${url}:`, err);
        setError(err instanceof Error ? err : new Error('Failed to load content'));
        onError?.(err instanceof Error ? err : new Error('Failed to load content'));
      } finally {
        setIsLoading(false);
      }
    };

    if (url) {
      loadContent();
    }
  }, [url, onLoad, onError]);

  if (isLoading) {
    return <div className={`markdown-loading ${className}`}>Loading content...</div>;
  }

  if (error) {
    return (
      <div className={`markdown-error ${className}`}>
        <h3>Error loading content</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

/**
 * A component that loads and renders multiple markdown files in sequence
 */
interface MultiMarkdownContentProps {
  /**
   * Array of markdown file URLs to load and combine
   */
  urls: string[];
  
  /**
   * Optional class name for the container
   */
  className?: string;
  
  /**
   * Optional separator between markdown contents
   */
  separator?: React.ReactNode;
}

export const MultiMarkdownContent: React.FC<MultiMarkdownContentProps> = ({
  urls,
  className = '',
  separator = <hr className="my-8" />,
}) => {
  return (
    <div className={`multi-markdown-content ${className}`}>
      {urls.map((url, index) => (
        <React.Fragment key={url}>
          {index > 0 && separator}
          <MarkdownContent url={url} />
        </React.Fragment>
      ))}
    </div>
  );
};

export default MarkdownContent;
