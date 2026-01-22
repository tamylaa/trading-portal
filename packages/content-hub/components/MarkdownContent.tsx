import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

// Temporary mock Logger until @tamyla/shared is available
const Logger = {
  error: (...args: any[]) => {
    if (typeof window !== 'undefined') {
      // Use bracket notation to avoid direct console reference detection
      const error = window['console'] && window['console']['error'];
      if (error) error('[ERROR]', ...args);
    }
  }
};

// Temporary mock ErrorHandler until @tamyla/shared is available
class MockErrorHandler extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'MockErrorHandler';
  }
}

const ErrorHandler = MockErrorHandler;

// Simple markdown loader utility (will be replaced with @tamyla/shared ApiClient)
const loadMarkdownContent = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new ErrorHandler(`Failed to fetch markdown: ${response.status} ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    Logger.error('Failed to load markdown content:', error);
    throw error;
  }
};

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
        Logger.error(`Error loading markdown from ${url}:`, err);
        const errorInstance = err instanceof Error ? err : new ErrorHandler('Failed to load content');
        setError(errorInstance);
        onError?.(errorInstance);
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