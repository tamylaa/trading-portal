#!/usr/bin/env node
import fetch from 'node-fetch';
const TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.TARGET_REPO || 'tamylaa/trading-portal';
if (!TOKEN) { console.error('GITHUB_TOKEN missing'); process.exit(1); }
const [owner, repo] = REPO.split('/');
let page = 1;
const perPage = 100;
let all = [];
while (true) {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=${perPage}&page=${page}`;
  const res = await fetch(url, { headers: { Authorization: `token ${TOKEN}`, 'User-Agent': 'repo-issues-list' } });
  if (!res.ok) { const t = await res.text(); throw new Error(`HTTP ${res.status}: ${t}`); }
  const items = await res.json();
  if (!items || items.length === 0) break;
  all = all.concat(items);
  if (items.length < perPage) break;
  page++;
}
const simplified = all.map(i => ({ number: i.number, title: i.title, state: i.state, labels: i.labels.map(l => l.name), assignees: i.assignees.map(a => a.login), url: i.html_url }));
console.log(JSON.stringify(simplified, null, 2));
