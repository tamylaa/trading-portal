import { ensureStory } from '@/stories/ensureStory';

export const githubCloudflareGuide = ensureStory({
  id: 'github-cloudflare',
  title: "How to Launch Your First Page Using GitHub + Cloudflare Pages: A Build in Public Journey",
  summary: "A checklist-driven, step-by-step tutorial to help you launch your first page with confidence.",
  content: `# How to Launch Your First Page Using GitHub + Cloudflare Pages: A Build in Public Journey

Launching a website can feel daunting, especially when you're navigating tools like GitHub and Cloudflare Pages for the first time. This guide will walk you through the exact steps to deploy a secure, fast, and SEO-optimized website using GitHub and Cloudflare Pages.

## Prerequisites
- A GitHub account
- A domain name (optional)
- Basic knowledge of Git and command line

## Step 1: Create a GitHub Repository
1. Go to GitHub and create a new repository
2. Initialize with a README
3. Clone the repository locally

## Step 2: Set Up Cloudflare Pages
1. Log in to your Cloudflare dashboard
2. Go to Pages > Create a project
3. Connect your GitHub account and select your repository

## Step 3: Configure Build Settings
- Framework preset: None (or your framework)
- Build command: (leave empty for static sites)
- Build output directory: /
- Root directory: / (or your site's root directory)

## Step 4: Deploy Your Site
1. Push your changes to GitHub
2. Cloudflare Pages will automatically detect the changes and start building
3. View your site at the provided .pages.dev URL

## Custom Domain Setup (Optional)
1. Go to your domain's DNS settings
2. Add a CNAME record pointing to your Cloudflare Pages URL
3. In Cloudflare Pages, go to Custom Domains and add your domain

## Final Checklist
- [ ] Repository is public/private as intended
- [ ] Build completed successfully
- [ ] Custom domain is working (if applicable)
- [ ] SSL/TLS encryption is enabled

## Common Issues and Solutions
- If your site doesn't load, check the build logs in Cloudflare
- For custom domain issues, verify DNS settings and propagation
- Ensure your build output directory is correctly specified`,
  createdAt: '2025-04-25',
  tags: ['cloudflare', 'github', 'deployment', 'SPA'],
  slug: 'github-cloudflare-guide'
});
