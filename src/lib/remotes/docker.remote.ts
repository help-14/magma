import { command, query } from '$app/server';
import * as v from 'valibot';

export const listContainers = query(
	v.object({
		dockerHost: v.string(),
		all: v.optional(v.boolean())
	}),
	async ({ dockerHost, all }) => {
		const url = `${dockerHost.replace(/\/+$/, '')}/containers/json${all ? '?all=1' : ''}`;
		const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
		if (!response.ok) throw new Error(`Docker API error: ${response.status}`);
		return response.json();
	}
);

export const inspectContainer = query(
	v.object({
		dockerHost: v.string(),
		containerId: v.string()
	}),
	async ({ dockerHost, containerId }) => {
		const url = `${dockerHost.replace(/\/+$/, '')}/containers/${containerId}/json`;
		const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
		if (!response.ok) throw new Error(`Docker API error: ${response.status}`);
		return response.json();
	}
);

export const startContainer = command(
	v.object({ dockerHost: v.string(), containerId: v.string() }),
	async ({ dockerHost, containerId }) => {
		const url = `${dockerHost.replace(/\/+$/, '')}/containers/${containerId}/start`;
		const response = await fetch(url, { method: 'POST' });
		return response.ok;
	}
);

export const stopContainer = command(
	v.object({ dockerHost: v.string(), containerId: v.string() }),
	async ({ dockerHost, containerId }) => {
		const url = `${dockerHost.replace(/\/+$/, '')}/containers/${containerId}/stop`;
		const response = await fetch(url, { method: 'POST' });
		return response.ok;
	}
);

export const restartContainer = command(
	v.object({ dockerHost: v.string(), containerId: v.string() }),
	async ({ dockerHost, containerId }) => {
		const url = `${dockerHost.replace(/\/+$/, '')}/containers/${containerId}/restart`;
		const response = await fetch(url, { method: 'POST' });
		return response.ok;
	}
);
