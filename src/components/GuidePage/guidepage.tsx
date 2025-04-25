// src/components/GuidePage.tsx
import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { PDFDownloadLink, Document, Page, Text, StyleSheet } from '@react-pdf/renderer';
import './guidepage.css';

const GuidePage: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // PDF styles
  const pdfStyles = StyleSheet.create({
    page: { padding: 30, fontSize: 12 },
    section: { marginBottom: 10 },
    title: { fontSize: 24, marginBottom: 20 },
    subtitle: { fontSize: 18, marginBottom: 10 },
    text: { marginBottom: 5 },
    code: { fontFamily: 'Courier', backgroundColor: '#f0f0f0', padding: 5 },
  });

  // PDF document
  const GuidePDF = () => (
    <Document>
      <Page style={pdfStyles.page}>
        <Text style={pdfStyles.title}>How to Launch Your First Page Using GitHub + Cloudflare Pages</Text>
        <Text style={pdfStyles.subtitle}>A Build in Public Journey</Text>
        <Text style={pdfStyles.text}>
          Launching a website can feel daunting, especially when you’re navigating tools like GitHub and Cloudflare Pages for the first time...
        </Text>
        {/* Add the full article content here */}
      </Page>
    </Document>
  );

  return (
    <div className="guide-page">
      <h1>How to Launch Your First Page Using GitHub + Cloudflare Pages: A Build in Public Journey</h1>

      <div className="download-section">
        <PDFDownloadLink document={<GuidePDF />} fileName="GitHub-Cloudflare-Guide.pdf">
          {({ loading }) => (
            <span>{loading ? 'Generating PDF...' : 'Download PDF'}</span>
          )}
        </PDFDownloadLink>
        <a href="https://grok.x.ai/conversation/your-thread-id" target="_blank" rel="noopener noreferrer">
          Access Full Step-by-Step Analysis (Grok Page Source)
        </a>
      </div>

      <section>
        <h2>Why GitHub + Cloudflare Pages?</h2>
        <p>
          <strong>GitHub</strong>: A platform for version control and collaboration, perfect for managing your website’s source code.
        </p>
        <p>
          <strong>Cloudflare Pages</strong>: A free, developer-friendly hosting solution that offers automatic HTTPS, global CDN, and seamless integration with GitHub for continuous deployment.
        </p>
      </section>

      <section>
        <h2 onClick={() => toggleSection('prerequisites')} className="clickable-section">
          Prerequisites Checklist {expandedSections['prerequisites'] ? '▼' : '▶'}
        </h2>
        {expandedSections['prerequisites'] && (
          <ul>
            <li>A GitHub account (<a href="https://github.com/">sign up here</a>).</li>
            <li>A Cloudflare account (<a href="https://www.cloudflare.com/">sign up here</a>).</li>
            <li>A custom domain (e.g., <code>yourdomain.com</code>) added to Cloudflare.</li>
            <li>A React project (or any static site) ready to deploy.</li>
            <li>Node.js and npm installed (<a href="https://nodejs.org/">download here</a>).</li>
            <li>Git installed (<a href="https://git-scm.com/">download here</a>).</li>
            <li>Basic knowledge of React, Git, and command-line tools.</li>
          </ul>
        )}
      </section>

      <section>
        <h2 onClick={() => toggleSection('step1')} className="clickable-section">
          Step 1: Set Up Your GitHub Repository {expandedSections['step1'] ? '▼' : '▶'}
        </h2>
        {expandedSections['step1'] && (
          <>
            <ol>
              <li>
                <strong>Create a New Repository</strong>:
                <p>Go to GitHub and create a new repository (e.g., <code>my-first-page</code>).</p>
              </li>
              <li>
                <strong>Clone the Repository Locally</strong>:
                <SyntaxHighlighter language="bash" style={vscDarkPlus}>
                  {`git clone https://github.com/your-username/my-first-page.git\ncd my-first-page`}
                </SyntaxHighlighter>
              </li>
              <li>
                <strong>Set Up Your Project</strong>:
                <SyntaxHighlighter language="bash" style={vscDarkPlus}>
                  {`npx create-react-app .`}
                </SyntaxHighlighter>
              </li>
              <li>
                <strong>Push Your Code to GitHub</strong>:
                <SyntaxHighlighter language="bash" style={vscDarkPlus}>
                  {`git add .\ngit commit -m "Initial commit: Set up React project"\ngit push origin main`}
                </SyntaxHighlighter>
              </li>
            </ol>
            <p className="lesson-learned">
              <strong>Lesson Learned</strong>: Always ensure your repository is public (or private with Cloudflare Pages access) so Cloudflare can pull your code for deployment.
            </p>
          </>
        )}
      </section>

      {/* Add remaining sections similarly... */}
      
      <section>
        <h2>Secrets Uncovered: Top Tips for Success</h2>
        <ol>
          <li><strong>Always Enforce HTTPS</strong>: Use Full SSL/TLS mode, HSTS, and “Always Use HTTPS” to avoid mixed content issues.</li>
          <li><strong>Set PUBLIC_URL Correctly</strong>: Use <code>PUBLIC_URL=/</code> for Cloudflare Pages to ensure relative asset paths.</li>
          <li><strong>Validate Your Build</strong>: Use a script to validate <code>package.json</code> homepage and asset paths.</li>
          <li><strong>Handle CSP Violations</strong>: Start with a permissive CSP, then tighten it once your site works.</li>
          <li><strong>Test Locally First</strong>: Serve your build locally to catch issues before deployment.</li>
        </ol>
      </section>
    </div>
  );
};

export default GuidePage;