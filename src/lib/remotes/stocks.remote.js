// @ts-nocheck
import { query } from '$app/server';
import * as v from 'valibot';

const headers = {
	'User-Agent': 'Mozilla/5.0'
};

const symbolCache = new Map();
const CACHE_TTL = 60_000;

function getCached(key) {
	const entry = symbolCache.get(key);
	if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
	return null;
}

function setCache(key, data) {
	symbolCache.set(key, { data, ts: Date.now() });
}

function parseStocksText(text) {
	return text
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => {
			const colonIdx = line.indexOf(':');
			if (colonIdx > 0) {
				return {
					symbol: line.slice(0, colonIdx).trim(),
					name: line.slice(colonIdx + 1).trim()
				};
			}
			return { symbol: line, name: line };
		});
}

async function fetchJson(url, retries = 2) {
	for (let attempt = 0; ; attempt++) {
		const response = await fetch(url, { headers });
		if (response.ok) return response.json();
		if (response.status !== 429 || attempt >= retries) {
			throw new Error(`${response.status} ${response.statusText}`);
		}
		await sleep(1000 * (attempt + 1));
	}
}

async function fetchSingle(symbol) {
	const cached = getCached(symbol);
	if (cached) return cached;

	const quoteData = await fetchJson(
		`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=5m`
	);
	const quoteResult = quoteData.chart?.result?.[0];
	if (!quoteResult) {
		const err = quoteData.chart?.error;
		throw new Error(err?.description || err?.code || 'No data');
	}
	const meta = quoteResult.meta || {};
	const price = meta.regularMarketPrice;
	const prevClose = meta.previousClose;
	if (price == null) throw new Error('Price unavailable');

	let chartData = null;
	try {
		chartData = await fetchJson(
			`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1mo&interval=1d`
		);
	} catch {
		chartData = null;
	}

	const chartResult = chartData?.chart?.result?.[0];
	const closes = chartResult?.indicators?.quote?.[0]?.close || [];
	const chart = closes.filter((c) => c != null).map((c) => Math.round(c * 100) / 100);

	const result = {
		symbol: meta.symbol || symbol,
		name: meta.shortName || meta.longName || symbol,
		price,
		change: price - (prevClose ?? price),
		changePercent: prevClose ? ((price - prevClose) / prevClose) * 100 : 0,
		marketState: meta.marketState || 'UNKNOWN',
		chart
	};
	setCache(symbol, result);
	return result;
}

async function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export const fetchStocks = query(
	v.object({
		stocks: v.string(),
		sortBy: v.optional(v.picklist(['default', 'change', 'absolute-change']), 'default')
	}),
	async ({ stocks: stocksText, sortBy }) => {
		const parsed = parseStocksText(stocksText);
		if (parsed.length === 0) {
			return { stocks: [], errors: [{ symbol: '', message: 'No stocks configured' }] };
		}

		const stocks = [];
		const errors = [];

		for (const entry of parsed) {
			const nameOverride = entry.name !== entry.symbol ? entry.name : null;
			try {
				const stock = await fetchSingle(entry.symbol);
				if (nameOverride) stock.name = nameOverride;
				stocks.push(stock);
			} catch (e) {
				errors.push({
					symbol: entry.symbol,
					message: e?.message || 'Unknown error'
				});
			}
			await sleep(300);
		}

		if (sortBy === 'change') {
			stocks.sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0));
		} else if (sortBy === 'absolute-change') {
			stocks.sort((a, b) => Math.abs(b.changePercent || 0) - Math.abs(a.changePercent || 0));
		}

		return { stocks, errors };
	}
);
