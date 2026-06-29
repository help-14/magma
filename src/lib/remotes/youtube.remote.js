// @ts-nocheck
import { query } from '$app/server';
import * as v from 'valibot';
import { createCache } from '$lib/server/cache.js';

const channelListSchema = v.array(v.string());

const cache = createCache(600_000, 50);

function parseFeedXml(xml) {
	const entries = [];
	const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
	let match;
	while ((match = entryRegex.exec(xml)) !== null) {
		const entry = match[1];
		const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
		const title = entry.match(/<title(?:[^>]*)>([^<]+)<\/title>/)?.[1];
		const published = entry.match(/<published>([^<]+)<\/published>/)?.[1];
		const thumbnail = entry.match(/<media:thumbnail[^>]*url="([^"]+)"/)?.[1];
		const channelName = entry.match(/<name>([^<]+)<\/name>/)?.[1];
		const channelUrl = entry.match(/<uri>([^<]+)<\/uri>/)?.[1];
		if (videoId && title) {
			entries.push({
				videoId,
				title,
				published: published || '',
				thumbnail: thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
				channelName: channelName || '',
				channelUrl: channelUrl || '',
				videoUrl: `https://www.youtube.com/watch?v=${videoId}`
			});
		}
	}
	return entries;
}

export const getYoutubeUploads = query(
	v.object({
		channels: channelListSchema,
		limit: v.optional(v.number(), 10)
	}),
	async ({ channels, limit }) => {
		try {
			const results = await Promise.allSettled(
				channels.map(async (channelId) => {
					const cacheKey = `uploads:${channelId}`;
					const cached = cache.get(cacheKey);
					if (cached) return cached;

					const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
					const response = await fetch(url);
					if (!response.ok) throw new Error(`HTTP ${response.status} for channel ${channelId}`);
					const xml = await response.text();
					const parsed = parseFeedXml(xml);
					if (parsed.length === 0) throw new Error(`No entries for channel ${channelId}`);

					cache.set(cacheKey, parsed);
					return parsed;
				})
			);

			const allVideos = [];
			for (const result of results) {
				if (result.status === 'fulfilled') {
					allVideos.push(...result.value);
				}
			}

			if (allVideos.length === 0) {
				return { ok: false, error: 'No videos found' };
			}

			allVideos.sort((a, b) => new Date(b.published) - new Date(a.published));
			const videos = allVideos.slice(0, limit);

			return { ok: true, data: { mode: 'uploads', videos } };
		} catch (err) {
			return { ok: false, error: err.message || String(err) };
		}
	}
);

export const getYoutubeLivestreams = query(
	v.object({ channels: channelListSchema }),
	async ({ channels }) => {
		try {
			const results = await Promise.allSettled(
				channels.map(async (channelId) => {
					const cacheKey = `live:${channelId}`;
					const cached = cache.get(cacheKey);
					if (cached) return cached;

					const liveUrl = `https://www.youtube.com/channel/${channelId}/live`;
					const response = await fetch(liveUrl);
					const videoMatch = response.url.match(/[?&]v=([^&]+)/);
					const videoId = videoMatch ? videoMatch[1] : null;

					if (!videoId) {
						const result = { channelId, isLive: false };
						cache.set(cacheKey, result);
						return result;
					}

					const oembedRes = await fetch(
						`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`
					);
					const info = oembedRes.ok ? await oembedRes.json() : null;

					const result = {
						channelId,
						isLive: true,
						videoId,
						title: info?.title || '',
						thumbnail: info?.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
						channelName: info?.author_name || '',
						videoUrl: `https://www.youtube.com/watch?v=${videoId}`
					};
					cache.set(cacheKey, result);
					return result;
				})
			);

			const channelsData = [];
			for (const result of results) {
				if (result.status === 'fulfilled') {
					channelsData.push(result.value);
				} else {
					channelsData.push({ channelId: 'unknown', isLive: false });
				}
			}

			return { ok: true, data: { mode: 'livestream', channels: channelsData } };
		} catch (err) {
			return { ok: false, error: err.message || String(err) };
		}
	}
);
