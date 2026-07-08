import { query } from '$app/server';
import * as v from 'valibot';
import { createCache } from '$lib/server/cache.js';

const cache = createCache<any>(3_600_000, 50);

function extractLastPage(linkHeader: string | null) {
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

		return cache.getOrSet(cleaned, async () => {
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

		let pullsData: any[] = [];
		let openPrsCount = 0;
		if (pullsRes.ok) {
			pullsData = await pullsRes.json();
			openPrsCount = extractLastPage(pullsRes.headers.get('Link')) ?? pullsData.length;
		}

		let issuesData: any[] = [];
		if (issuesRes.ok) {
			const allIssues: any[] = await issuesRes.json();
			issuesData = allIssues
				.filter((i: any) => !i.pull_request)
				.slice(0, 5)
				.map((i: any) => ({ title: i.title, htmlUrl: i.html_url, number: i.number, user: i.user?.login }));
		}

		const openIssues = repoData.open_issues_count - openPrsCount;

		const result = {
			stars: repoData.stargazers_count ?? 0,
			forks: repoData.forks_count ?? 0,
			openPrs: openPrsCount,
			openIssues: Math.max(0, openIssues),
			pulls: pullsData.map((p: any) => ({ title: p.title, htmlUrl: p.html_url, number: p.number, user: p.user?.login })),
			issues: issuesData,
			description: repoData.description ?? '',
			language: repoData.language ?? '',
			htmlUrl: repoData.html_url ?? `https://github.com/${cleaned}`,
		};

			return result;
		});
	}
);
