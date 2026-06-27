// @ts-nocheck
import { query } from '$app/server';
import * as v from 'valibot';

const cache = new Map();
const CACHE_TTL = 3_600_000; // 1 hour

function getCached(key) {
	const entry = cache.get(key);
	if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
	return null;
}

function setCache(key, data) {
	cache.set(key, { data, ts: Date.now() });
}

function extractLastPage(linkHeader) {
	if (!linkHeader) return null;
	const m = linkHeader.match(/page=(\d+)>; rel="last"/);
	return m ? parseInt(m[1], 10) : null;
}

export const fetchGithubRepo = query(
	v.object({ repo: v.string() }),
	async ({ repo }) => {
		if (!repo.trim()) throw new Error('Repository not configured');
		const cleaned = repo.trim().replace(/^https?:\/\/github\.com\//, '');
		if (!/^[\w.-]+\/[\w.-]+$/.test(cleaned)) {
			throw new Error('Invalid repo format. Use owner/repo (e.g. "help-14/magma")');
		}

		const cached = getCached(cleaned);
		if (cached) return cached;

		const headers = { Accept: 'application/vnd.github.v3+json' };
		const repoUrl = `https://api.github.com/repos/${cleaned}`;
		const [repoRes, pullsRes, issuesRes] = await Promise.all([
			fetch(repoUrl, { headers }),
			fetch(`${repoUrl}/pulls?state=open&per_page=5&sort=created&direction=desc`, { headers }),
			fetch(`${repoUrl}/issues?state=open&per_page=10&sort=created&direction=desc`, { headers }),
		]);

		if (!repoRes.ok) {
			if (repoRes.status === 404) {
				throw new Error(`Repository "${cleaned}" not found on GitHub`);
			}
			throw new Error(`GitHub API ${repoRes.status}: ${repoRes.statusText}`);
		}
		const repoData = await repoRes.json();

		let pullsData = [];
		let openPrsCount = 0;
		if (pullsRes.ok) {
			pullsData = await pullsRes.json();
			openPrsCount = extractLastPage(pullsRes.headers.get('Link')) ?? pullsData.length;
		}

		let issuesData = [];
		if (issuesRes.ok) {
			const allIssues = await issuesRes.json();
			issuesData = allIssues
				.filter(i => !i.pull_request)
				.slice(0, 5)
				.map(i => ({ title: i.title, htmlUrl: i.html_url, number: i.number, user: i.user?.login }));
		}

		const openIssues = repoData.open_issues_count - openPrsCount;

		const result = {
			stars: repoData.stargazers_count ?? 0,
			forks: repoData.forks_count ?? 0,
			openPrs: openPrsCount,
			openIssues: Math.max(0, openIssues),
			pulls: pullsData.map(p => ({ title: p.title, htmlUrl: p.html_url, number: p.number, user: p.user?.login })),
			issues: issuesData,
			description: repoData.description ?? '',
			language: repoData.language ?? '',
			htmlUrl: repoData.html_url ?? `https://github.com/${cleaned}`,
		};

		setCache(cleaned, result);
		return result;
	}
);
