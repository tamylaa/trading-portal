#!/usr/bin/env node
/*
  scripts/create-issues.mjs
  - Reads all Markdown files under docs/issues/ and creates GitHub issues for each
  - Uses process.env.GITHUB_TOKEN for authentication (recommended), or will abort if not set
  - Supports dry-run via DRY_RUN=1
  - Supports target repo override using TARGET_REPO (format owner/repo). Default: tamylaa/trading-portal

  Usage (PowerShell):
    $env:GITHUB_TOKEN = 'ghp_xxx' ; node scripts/create-issues.mjs
  Or dry-run:
    $env:DRY_RUN=1 ; node scripts/create-issues.mjs
*/

import fs from 'fs';
import path from 'path';

const TOKEN = process.env.GITHUB_TOKEN;
const DRY_RUN = !!process.env.DRY_RUN;
const TARGET_REPO = process.env.TARGET_REPO || 'tamylaa/trading-portal';

function parseIssueFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/);
  const meta = {};
  let bodyStart = 0;
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const l = lines[i];
    const m = l.match(/^([^:]+):\s*(.*)$/);
    if (m) {
      const key = m[1].trim().toLowerCase();
      const val = m[2].trim();
      meta[key] = val;
      bodyStart = i + 1;
    } else if (l.trim() === '') {
      bodyStart = i + 1;
      break;
    } else {
      bodyStart = i;
      break;
    }
  }
  const body = lines.slice(bodyStart).join('\n').trim();
  return {
    title: meta['title'] || path.basename(filePath),
    labels: meta['labels'] ? meta['labels'].split(',').map(s => s.trim()).filter(Boolean) : ['triaged'],
    assignees: meta['assignee'] ? meta['assignee'].split(',').map(s => s.trim()).filter(Boolean) : undefined,
    body: body || '(no body provided)',
    file: filePath
  };
}

async function createIssue(issue) {
  const [owner, repo] = TARGET_REPO.split('/');
  const url = `https://api.github.com/repos/${owner}/${repo}/issues`;
  const payload = {
    title: issue.title,
    body: issue.body,
    labels: issue.labels
  };
  if (issue.assignees) payload.assignees = issue.assignees;

  if (DRY_RUN) {
    console.log('[dry-run] Would create issue:', JSON.stringify(payload, null, 2));
    return null;
  }

  if (!TOKEN) {
    throw new Error('GITHUB_TOKEN missing. Set process.env.GITHUB_TOKEN and re-run.');
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'create-issues-script'
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${text}`);
  }
  return res.json();
}

async function main() {
  const dir = path.join(process.cwd(), 'docs', 'issues');
  if (!fs.existsSync(dir)) {
    console.error('No docs/issues directory found');
    process.exit(1);
  }
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).map(f => path.join(dir, f));
  if (files.length === 0) {
    console.log('No issue files found in docs/issues/');
    process.exit(0);
  }

  console.log(`Target repo: ${TARGET_REPO}`);
  console.log(DRY_RUN ? 'Mode: DRY RUN' : 'Mode: CREATE ISSUES');

  const results = [];
  for (const f of files) {
    const issue = parseIssueFile(f);
    try {
      const created = await createIssue(issue);
      if (created && created.html_url) {
        console.log(`Created: ${created.html_url} <- ${path.basename(f)}`);
        results.push({ file: f, url: created.html_url });
      } else {
        console.log(`[dry-run] Prepared: ${issue.title}`);
      }
    } catch (err) {
      console.error(`Failed to create issue from ${f}: ${err.message}`);
    }
  }

  if (!DRY_RUN) {
    const out = path.join(process.cwd(), 'reports', 'created-issues.json');
    if (!fs.existsSync(path.dirname(out))) fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(results, null, 2), 'utf8');
    console.log('Created issues report:', out);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
