type CacheEntry<T> = { data: T; ts: number; ttl: number }

export function createCache<T = unknown>(defaultTTL = 60_000, maxSize = 100) {
	const store = new Map<string, CacheEntry<T>>()
	const order: string[] = []

	function touch(key: string) {
		const i = order.indexOf(key)
		if (i !== -1) order.splice(i, 1)
		order.push(key)
	}

	function evict() {
		while (order.length > maxSize) {
			const key = order.shift()
			if (!key) continue
			store.delete(key)
		}
	}

	return {
		get(key: string): T | null {
			const entry = store.get(key)
			if (!entry) return null
			if (Date.now() - entry.ts >= entry.ttl) {
				store.delete(key)
				const i = order.indexOf(key)
				if (i !== -1) order.splice(i, 1)
				return null
			}
			touch(key)
			return entry.data
		},
		set(key: string, data: T, ttl?: number) {
			store.set(key, { data, ts: Date.now(), ttl: ttl ?? defaultTTL })
			touch(key)
			evict()
		},
		delete(key: string) {
			store.delete(key)
			const i = order.indexOf(key)
			if (i !== -1) order.splice(i, 1)
		},
		clear() {
			store.clear()
			order.length = 0
		}
	}
}
