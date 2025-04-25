export interface Story {
  id: string;
  title: string;
  summary: string;
  content: string; // Markdown
  pdfContent?: string;
  grokUrl?: string;
  createdAt: string;
  tags?: string[];
}

export const stories: Story[] = [
  {
    id: 'github-cloudflare',
    title: "How to Launch Your First Page Using GitHub + Cloudflare Pages: A Build in Public Journey",
    summary: "A checklist-driven, step-by-step tutorial to help you launch your first page with confidence.",
    content: `How to Launch Your First Page Using GitHub + Cloudflare Pages: A Build in Public Journey

Launching a website can feel daunting, especially when you're navigating tools like GitHub and Cloudflare Pages for the first time. At Tamyla Trading Ventures LLP, we recently deployed our trading-portal project---a React-based single-page application (SPA)---using GitHub for version control and Cloudflare Pages for hosting. In this Build in Public guide, I'll walk you through the exact steps we took, share the challenges we faced (like CSP violations and HTTPS enforcement issues), and provide a checklist-driven, step-by-step tutorial to help you launch your first page with confidence. Whether you're a developer, entrepreneur, or small business owner, this guide will help you deploy a secure, fast, and SEO-optimized website using GitHub and Cloudflare Pages.

Let's dive in!

## Why GitHub + Cloudflare Pages?

**GitHub**: A platform for version control and collaboration, perfect for managing your website's source code.

**Cloudflare Pages**: A free, developer-friendly hosting solution that offers automatic HTTPS, global CDN, and seamless integration with GitHub for continuous deployment.

**Together**: This combo allows you to build, deploy, and manage a website with minimal cost, high performance, and robust security.

Our project, tamylaa/trading-portal, is a React SPA deployed at tamyla.com. We'll use it as a case study to uncover the secrets of a successful launch.

---

## Prerequisites Checklist

- A GitHub account (sign up here).
- A Cloudflare account (sign up here).
- A custom domain (e.g., yourdomain.com) added to Cloudflare.
- A React project (or any static site) ready to deploy. We'll use a React app as an example.
- Node.js and npm installed on your local machine (download here).
- Git installed (download here).
- Basic knowledge of React, Git, and command-line tools.

---

## Step-by-Step Guide to Launch Your First Page

### Step 1: Set Up Your GitHub Repository

**Create a New Repository:**
Go to GitHub and create a new repository (e.g., my-first-page).

Initialize it with a README.md file.

**Clone the Repository Locally:**
    git clone https://github.com/your-username/my-first-page.git
    cd my-first-page

**Set Up Your Project:**
If you're using React, create a new app:
    npx create-react-app .

For our trading-portal, we used CRACO for custom Webpack configurations, but a standard CRA setup works fine.

**Push Your Code to GitHub:**
    git add .
    git commit -m "Initial commit: Set up React project"
    git push origin main

_Lesson Learned: Always ensure your repository is public (or private with Cloudflare Pages access) so Cloudflare can pull your code for deployment._

### Step 2: Connect Cloudflare Pages to GitHub

**Log In to Cloudflare:**
Go to your Cloudflare dashboard and select Pages from the sidebar.

**Create a New Project:**
Click Create a project > Connect to Git.
Authorize Cloudflare to access your GitHub account.

**Select Your Repository:**
Choose the repository (my-first-page) you created.

**Configure Build Settings:**
- Project Name: my-first-page
- Production Branch: main
- Framework Preset: Select Create React App (or your framework).
- Build Command: npm run build
- Build Output Directory: build

Environment Variables (optional for now):
We'll set these later to fix issues like incorrect asset paths.

Click Save and Deploy.

**Wait for Deployment:**
Cloudflare Pages will build and deploy your site. You'll get a temporary URL (e.g., my-first-page.pages.dev).

_Lesson Learned: Cloudflare Pages auto-detects most build settings for React projects, but double-check the build command and output directory to avoid deployment failures._

### Step 3: Set Up Your Custom Domain

**Add Your Domain to Cloudflare:**
In the Cloudflare dashboard, click Add a Site and enter your domain (e.g., yourdomain.com).
Follow the instructions to update your domain's nameservers to Cloudflare's.

**Configure DNS Records:**
Go to DNS > Records.
Add two records:
- Type: A, Name: @, IPv4 Address: 192.0.2.1 (a placeholder; Cloudflare Pages will handle this).
- Type: A, Name: www, IPv4 Address: 192.0.2.1.
Set Proxy Status to Proxied for both.

**Link Your Custom Domain:**
In Pages > my-first-page > Custom Domains, add:
- yourdomain.com
- www.yourdomain.com
Cloudflare will automatically issue SSL certificates.

_Lesson Learned: For our tamyla.com, we initially forgot to set up a redirect from www.tamyla.com to https://tamyla.com, which caused issues with resource loading. We'll fix this in the next step._

### Step 4: Enforce HTTPS and Redirect www to Non-www

**Enable Always Use HTTPS:**
Go to SSL/TLS > Overview.
Turn on Always Use HTTPS to redirect all HTTP requests to HTTPS.

**Enable HSTS:**
Go to SSL/TLS > Edge Certificates.
Enable HTTP Strict Transport Security (HSTS):
- Max Age: 12 months
- Include SubDomains: Yes
- Preload: Yes

**Set Up a Page Rule for www Redirect:**
Go to Rules > Page Rules.
Create a rule:
- URL Pattern: www.yourdomain.com/*
- Setting: Forwarding URL (301 - Permanent Redirect)
- Destination: https://yourdomain.com/$1

_Lesson Learned: For tamyla.com, we encountered a CSP violation because the favicon was requested over HTTP (http://www.tamyla.com/assets/favicon.ico). Enforcing HTTPS and redirecting www to the apex domain ensured all requests used HTTPS, aligning with our CSP._

### Step 5: Optimize SSL/TLS Settings

**Set SSL/TLS Mode to Full:**
Go to SSL/TLS > Overview.
Set Encryption Mode to Full to enforce HTTPS for all connections.

**Set Minimum TLS Version:**
Set Minimum TLS Version to TLS 1.2 for better security (TLS 1.0 and 1.1 are deprecated).

**Enable TLS 1.3:**
Turn on TLS 1.3 for improved performance and security.

**Enable Automatic HTTPS Rewrites:**
Turn on Automatic HTTPS Rewrites to fix mixed content issues (e.g., HTTP URLs in your HTML).

_Lesson Learned: Initially, we used the Flexible SSL/TLS mode, which allowed HTTP connections between Cloudflare and our origin, causing CSP violations. Switching to Full mode resolved this by ensuring end-to-end HTTPS._

### Step 6: Fix Build Issues with PUBLIC_URL

**Set Up Environment Variables:**
Create a .env.production file in your project root:
    PUBLIC_URL=/

For our trading-portal, we initially had PUBLIC_URL=https://tamylaa.github.io/trading-portal (from a previous GitHub Pages deployment), which caused assets to load from the wrong URL and triggered CSP violations.

**Update package.json:**
Ensure the homepage field matches your domain:
    "homepage": "https://yourdomain.com"

**Clean and Build:**
    rm -rf build node_modules
    npm cache clean --force
    npm install
    npm run build
This ensures assets in build/index.html use relative paths (e.g., /assets/favicon.ico).

_Lesson Learned: The incorrect PUBLIC_URL in our .env.production file caused the favicon to load from https://tamylaa.github.io/trading-portal/assets/favicon.ico, which violated our CSP. Setting PUBLIC_URL=/ fixed this by using relative paths._

### Step 7: Configure Content Security Policy (CSP)

**Create a _headers File:**
In your project's public folder, create _headers:
    /* 
      Content-Security-Policy: default-src 'self' cdnjs.cloudflare.com https://yourdomain.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' cdnjs.cloudflare.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://yourdomain.com; connect-src 'self' https://yourdomain.com
      X-Frame-Options: SAMEORIGIN
      Referrer-Policy: strict-origin-when-cross-origin
    */

This CSP allows:
- Scripts and styles from cdnjs.cloudflare.com (e.g., Font Awesome).
- Images from HTTPS sources.
- XHR/fetch requests to your domain.

**Automate _headers Creation:**
We created a build-check.ps1 script to generate _headers:
    function Create-HeadersFile {
        $headersPath = Join-Path $PSScriptRoot "public/_headers"
        Write-Log "Generating public/_headers for Cloudflare Pages..." "INFO"
        $headersContent = @"
        /* 
          Content-Security-Policy: default-src 'self' cdnjs.cloudflare.com https://tamyla.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' cdnjs.cloudflare.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://tamyla.com; connect-src 'self' https://tamyla.com
          X-Frame-Options: SAMEORIGIN
          Referrer-Policy: strict-origin-when-cross-origin
        "@
        Set-Content -Path $headersPath -Value $headersContent -Force
        Write-Log "public/_headers generated successfully" "SUCCESS"
    }

_Lesson Learned: A strict CSP blocked our favicon because it was requested over HTTP. We temporarily relaxed the CSP to debug (img-src ... http://www.tamyla.com), then enforced HTTPS once the issue was resolved._

### Step 8: Set Up SPA Routing with _redirects

**Create a _redirects File:**
In public, create _redirects:
    /*  /index.html  200

This ensures all routes in your SPA (e.g., /about) serve index.html, allowing React Router to handle client-side routing.

_Lesson Learned: Without _redirects, refreshing on a subroute (e.g., tamyla.com/about) returned a 404 error. This simple file fixed our SPA routing._

### Step 9: Deploy and Test

**Push Changes to GitHub:**
    git add .
    git commit -m "Prepare build for Cloudflare Pages"
    git push origin main

**Purge Cloudflare Cache:**
Go to Caching > Configuration > Purge Everything.

**Test Your Site:**
Visit https://yourdomain.com and https://www.yourdomain.com.
Open DevTools (F12):
- Network Tab: Ensure assets load from https://yourdomain.com (e.g., /assets/favicon.ico).
- Console Tab: Check for CSP violations or errors.

Verify SPA routing works (e.g., navigate to /about and refresh).

_Lesson Learned: We initially saw a blank page on tamyla.com because the JavaScript bundle was blocked by the CSP. Fixing HTTPS enforcement and PUBLIC_URL resolved this._

---

## Secrets Uncovered: Top Tips for Success

- **Always Enforce HTTPS:**
  - Use Full SSL/TLS mode, HSTS, and "Always Use HTTPS" to avoid mixed content issues.
  - Redirect www to the apex domain to simplify resource loading.
- **Set PUBLIC_URL Correctly:**
  - Use PUBLIC_URL=/ for Cloudflare Pages to ensure relative asset paths, avoiding CSP violations from incorrect domains.
- **Validate Your Build:**
  - Use a script like build-check.ps1 to validate:
    - package.json homepage.
    - Asset paths in public/index.html and build/index.html.
    - Presence of _redirects and _headers.
- **Handle CSP Violations:**
  - Start with a permissive CSP, then tighten it once your site works.
  - Use browser DevTools to debug blocked resources.
- **Test Locally First:**
  - Serve your build locally (npm install -g serve && serve build -l 3000) to catch issues before deployment.

---

## Final Checklist Before Launch

- GitHub repository set up and code pushed.
- Cloudflare Pages project created and connected to GitHub.
- Custom domain added and DNS configured.
- HTTPS enforced with SSL/TLS settings optimized.
- PUBLIC_URL=/ set in .env.production.
- _headers file configured with a secure CSP.
- _redirects file added for SPA routing.
- Site deployed and tested on https://yourdomain.com.
- No CSP violations or errors in browser DevTools.

`,
    grokUrl: "https://grok.x.ai/conversation/your-thread-id",
    createdAt: "2025-04-25",
    tags: ["cloudflare", "github", "deployment", "SPA"]
  }
];
