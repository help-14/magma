// @ts-nocheck
import { query } from '$app/server';
import * as v from 'valibot';

const listCache = new Map();

const headers = {
	'User-Agent': 'Mozilla/5.0'
};

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
		await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
	}
}

async function fetchSingle(symbol) {
	const [quoteData, chartData] = await Promise.all([
		fetchJson(
			`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=5m`
		),
		fetchJson(
			`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1mo&interval=1d`
		).catch(() => null)
	]);

	const quoteResult = quoteData.chart?.result?.[0];
	if (!quoteResult) {
		const err = quoteData.chart?.error;
		throw new Error(err?.description || err?.code || 'No data');
	}
	const meta = quoteResult.meta || {};
	const price = meta.regularMarketPrice;
	const prevClose = meta.previousClose;
	if (price == null) throw new Error('Price unavailable');

	const chartResult = chartData?.chart?.result?.[0];
	const closes = chartResult?.indicators?.quote?.[0]?.close || [];
	const chart = closes.filter((c) => c != null).map((c) => Math.round(c * 100) / 100);

	return {
		symbol: meta.symbol || symbol,
		name: meta.shortName || meta.longName || symbol,
		price,
		change: price - (prevClose ?? price),
		changePercent: prevClose ? ((price - prevClose) / prevClose) * 100 : 0,
		marketState: meta.marketState || 'UNKNOWN',
		chart
	};
}

export const fetchStocks = query(
	v.object({
		stocks: v.string(),
		sortBy: v.optional(v.picklist(['default', 'change', 'absolute-change']), 'default'),
		cacheTime: v.optional(v.number(), 300)
	}),
	async ({ stocks: stocksText, sortBy, cacheTime }) => {
		const parsed = parseStocksText(stocksText);
		if (parsed.length === 0) {
			return { stocks: [], errors: [{ symbol: '', message: 'No stocks configured' }] };
		}

		const cacheKey = `${stocksText}::${sortBy}::${cacheTime}`;
		const cached = listCache.get(cacheKey);
		if (cached && Date.now() - cached.ts < cacheTime * 1000) {
			return cached.data;
		}

		const results = await Promise.allSettled(
			parsed.map(async (entry) => {
				const nameOverride = entry.name !== entry.symbol ? entry.name : null;
				const stock = await fetchSingle(entry.symbol);
				if (nameOverride) stock.name = nameOverride;
				return stock;
			})
		);

		const stocks = [];
		const errors = [];
		for (const result of results) {
			if (result.status === 'fulfilled') {
				stocks.push(result.value);
			} else {
				errors.push({
					symbol: 'unknown',
					message: result.reason?.message || 'Unknown error'
				});
			}
		}

		if (sortBy === 'change') {
			stocks.sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0));
		} else if (sortBy === 'absolute-change') {
			stocks.sort((a, b) => Math.abs(b.changePercent || 0) - Math.abs(a.changePercent || 0));
		}

		const data = { stocks, errors };
		listCache.set(cacheKey, { data, ts: Date.now() });
		return data;
	}
);
