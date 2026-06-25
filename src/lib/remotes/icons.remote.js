// @ts-nocheck
import { query } from '$app/server';
import * as v from 'valibot';

const localIcons = [
	'calendar',
	'docker',
	'film',
	'image',
	'play',
	'search',
	'server',
	'settings',
	'storage',
	'timer',
	'tv',
	'weather',
	'youtube'
];

export const searchIcons = query(
	v.object({
		term: v.string()
	}),
	async ({ term }) => {
		const queryText = term.trim();
		const localMatches = localIcons.filter((icon) => icon.includes(queryText.toLowerCase()));

		if (queryText.length < 2) {
			return localMatches.slice(0, 8);
		}

		const url = new URL('https://api.iconify.design/search');
		url.searchParams.set('query', queryText);
		url.searchParams.set('limit', '24');

		try {
			const response = await fetch(url);
			if (!response.ok) return localMatches.slice(0, 8);
			const result = await response.json();
			return [...new Set([...localMatches, ...(result.icons || [])])].slice(0, 24);
		} catch {
			return localMatches.slice(0, 8);
		}
	}
);
