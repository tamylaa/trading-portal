import { ensureStory } from '@/stories/ensureStory';
import { defaultTemplate } from '@/stories/templates/default';

declare global {
  interface Window {
    BrevoConversations?: (action: string, options?: any) => void;
  }
}

export const brevoChatIntegration = ensureStory({
  ...defaultTemplate,
  id: 'brevo-chat-integration',
  title: 'Integrating Brevo Chat in React: Solving CSP and Deployment Challenges',
  summary: 'Comprehensive guide on resolving Content Security Policy (CSP) and deployment issues when integrating Brevo chat widget in a production React application.',
  content: `A technical guide to implementing Brevo's chat widget with proper CSP configuration and deployment best practices for React applications.

## Table of Contents
- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Key Components](#key-components)
- [Implementation Steps](#implementation-steps)
  - [1. Content Security Policy (CSP) Configuration](#1-content-security-policy-csp-configuration)
  - [2. React Component Implementation](#2-react-component-implementation)
  - [3. Environment Configuration](#3-environment-configuration)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [FAQ](#faq)
- [Additional Resources](#additional-resources)

## Introduction

Brevo's chat widget enhances customer engagement but requires careful integration in React applications, especially in production environments. This guide addresses common challenges and provides a robust solution.

## Prerequisites

- React application (version 16.8+ with hooks)
- Brevo account with Conversations enabled
- Cloudflare Pages deployment
- Basic knowledge of React hooks and environment variables

## Key Components

1. **CSP Headers**
   - Security policies for script loading
   - Domain whitelisting for Brevo services
   - Security headers configuration

2. **React Component**
   - Dynamic script loading
   - Environment-based configuration
   - Performance optimization

3. **Deployment**
   - Environment variables setup
   - Cloudflare Pages configuration
   - Build and deployment process

## Implementation Steps

### 1. Content Security Policy (CSP) Configuration

Create or update your \`public/_headers\` file:

\`\`\`
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://brevo.com https://conversations-widget.brevo.com; script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://brevo.com https://conversations-widget.brevo.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.brevo.com https://*.brevo.tech; frame-src 'self' https://*.brevo.com; child-src 'self' https://*.brevo.com;
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
*/
\`\`\`

### 2. React Component Implementation

Create \`src/components/chat/ChatButton.tsx\`:

\`\`\`tsx
import React, { useEffect, useState } from 'react';

const loadBrevoScript = (websiteId: string) => {
  if (typeof window !== 'undefined' && !window.BrevoConversations) {
    const script = document.createElement('script');
    script.src = 'https://conversations-widget.brevo.com/brevo-conversations.js';
    script.async = true;
    script.onload = () => {
      if (window.BrevoConversations) {
        window.BrevoConversations('init', {
          websiteId,
          theme: {
            primaryColor: '#000000',
            secondaryColor: '#ffffff'
          }
        });
      }
    };
    document.body.appendChild(script);
  }
};

export const ChatButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const websiteId = process.env.REACT_APP_BREVO_WEBSITE_ID;

  useEffect(() => {
    if (websiteId) {
      loadBrevoScript(websiteId);
    }
  }, [websiteId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <button 
      className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      onClick={() => window.BrevoConversations?.('show')}
      aria-label="Open chat"
    >
      Chat with Us
    </button>
  );
};

#### .env.production
\`\`\`env
REACT_APP_BREVO_WEBSITE_ID=your-website-id-here
\`\`\`

## Deployment

### Cloudflare Pages Setup
1. Navigate to your Cloudflare Pages project
2. Go to Settings > Environment variables
3. Add a new variable:
   - Name: \`REACT_APP_BREVO_WEBSITE_ID\`
   - Value: Your Brevo website ID

### Verification
1. After deployment, check the response headers
2. Verify the chat widget loads correctly
3. Test the chat functionality

## Troubleshooting

### CSP Violations
- **Issue**: Console shows CSP errors for Brevo domains
- **Solution**: Ensure all required domains are whitelisted:
  - \`brevo.com\`
  - \`conversations-widget.brevo.com\`
  - \`*.brevo.tech\`

### Script Loading Issues
- **Issue**: Widget doesn't appear
- **Solution**:
  1. Check browser console for 404 errors
  2. Verify script URL is correct
  3. Ensure CSP allows the script to load

### Environment Variables
- **Issue**: Widget shows "Website ID not configured"
- **Solution**:
  1. Confirm environment variables are set
  2. Check for typos in variable names
  3. Rebuild and redeploy after changes

## Best Practices

1. **Security**
   - Use environment variables for sensitive data
   - Maintain strict CSP policies
   - Regularly audit third-party scripts

2. **Performance**
   - Load chat widget asynchronously
   - Implement lazy loading
   - Monitor page load impact

3. **Maintenance**
   - Document all integrations
   - Track API keys and credentials
   - Set up monitoring

## FAQ

**Q: How do I get my Brevo website ID?**  
A: Log in to your Brevo account, navigate to Conversations > Settings, and find your Website ID.

**Q: Why is my chat widget not appearing in production?**  
A: Common reasons include CSP restrictions, missing environment variables, or script loading issues. Check the browser console for specific errors.

**Q: How can I customize the chat widget's appearance?**  
A: The widget's appearance can be customized through the theme object in the initialization options. Refer to Brevo's documentation for available options.

**Q: Is it possible to load the chat widget only on specific pages?**  
A: Yes, you can conditionally render the ChatButton component based on your routing logic.

**Q: How do I test the chat widget before going live?**  
A: Test in a staging environment first, and use browser developer tools to verify CSP headers and script loading.

## Additional Resources

- [Brevo Conversations Documentation](https://help.brevo.com/hc/en-us/sections/360007268439-Conversations)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [MDN Web Docs: CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)`,
  createdAt: '2025-06-08',
  updatedAt: '2025-06-08',
  tags: [
    'brevo', 
    'chat', 
    'csp', 
    'react', 
    'cloudflare', 
    'deployment',
    'security',
    'integration'
  ],
  slug: 'brevo-chat-integration',
  readingTime: 10,
  wordCount: 1200,
  difficulty: 'intermediate',
  featured: true,
  draft: false,
  coverImage: '/images/stories/brevo-chat-integration.jpg',
  coverImageAlt: 'Brevo Chat Widget Integration in React',
  relatedStories: ['github-cloudflare-guide'],
  author: 'Tamyla Team',
  authorRole: 'Technical Documentation Team',
  authorAvatar: '/images/authors/tamyla-avatar.png',
  authorBio: 'Experts in web development and technical documentation',
  language: 'en',
  category: 'technical-guides',
  version: '1.0.0',
  canonicalUrl: '/guides/brevo-chat-integration'
});
