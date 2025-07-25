import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { stories, Story } from '../stories/stories';
import ReactMarkdown from 'react-markdown';
import { PDFDownloadLink, Document, Page, Text, StyleSheet } from '@react-pdf/renderer';
import { Helmet } from 'react-helmet';
import { processMarkdownWithComponents } from '../stories/utils/markdownUtils';

const StoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const story = stories.find((s: Story) => s.id === id);

  // Initialize EngageKit when component mounts
  useEffect(() => {
    // Check if EngageKit is available
    if (typeof window !== 'undefined' && window.EngageKit) {
      console.log('Initializing EngageKit in StoryDetailPage');
      window.EngageKit.init({
        accountId: 'trading-portal-demo',
        modules: {
          highlighter: {
            enabled: true,
            highlightColor: '#ffeb3b',
            minSelectionLength: 3,
            showToolbar: true,
            toolbarPosition: 'above',
          },
          readingProgress: {
            enabled: true,
            height: '4px',
            color: '#4CAF50',
            zIndex: 9999,
          },
        },
      });
    } else {
      console.warn('EngageKit not found. Make sure the EngageKit script is loaded.');
    }

    // Cleanup function
    return () => {
      // Cleanup if needed when component unmounts
    };
  }, [id]); // Re-run effect if story ID changes

  if (!story) {
    return <div className="story-not-found">Story not found. <Link to="/stories">Back to stories</Link></div>;
  }

  // PDF styles
  const pdfStyles = StyleSheet.create({
    page: { padding: 30, fontSize: 12 },
    title: { fontSize: 24, marginBottom: 20 },
    subtitle: { fontSize: 18, marginBottom: 10 },
    text: { marginBottom: 5 },
  });

  const StoryPDF = () => {
    if (!story) return null;
    
    return (
      <Document>
        <Page style={pdfStyles.page}>
          <Text style={pdfStyles.title}>{story.title}</Text>
          <Text style={pdfStyles.text}>{story.summary}</Text>
          <Text style={pdfStyles.text}>{story.content}</Text>
          {'grokUrl' in story && story.grokUrl && (
            <Text style={pdfStyles.text}>See more: {story.grokUrl}</Text>
          )}
        </Page>
      </Document>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <main className="story-detail-page guide-page">
      <Helmet>
        <title>{story.title} | Tamyla Stories</title>
        <meta name="description" content={story.summary} />
        <meta property="og:title" content={story.title} />
        <meta property="og:description" content={story.summary} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://tamyla.com/stories/${story.id}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": story.title,
          "datePublished": story.createdAt,
          "author": { "@type": "Person", "name": "Tamyla Team" },
          "description": story.summary,
          "articleBody": story.content
        })}</script>
      </Helmet>
      <article>
        <header>
          <h1>{story.title}</h1>
          <div className="story-meta">
            <time dateTime={story.createdAt}>{formatDate(story.createdAt)}</time>
            {story.tags && (
              <span className="story-tags">
                {story.tags.map(tag => (
                  <span key={tag} className="story-tag">{tag}</span>
                ))}
              </span>
            )}
          </div>
        </header>
        <section className="story-content">
          {story.metadata?.containsComponents 
            ? processMarkdownWithComponents(story.content)
            : <ReactMarkdown>{story.content}</ReactMarkdown>
          }
        </section>
        <div className="download-section">
          <PDFDownloadLink document={<StoryPDF />} fileName={`${story.id}.pdf`}>
            {({ loading }) => <span>{loading ? 'Generating PDF...' : 'Download PDF'}</span>}
          </PDFDownloadLink>
          {story.grokUrl && (
            <a href={story.grokUrl} target="_blank" rel="noopener noreferrer">
              Access Full Step-by-Step Analysis (Grok Page Source)
            </a>
          )}
        </div>
      </article>
    </main>
  );
};

export default StoryDetailPage;
