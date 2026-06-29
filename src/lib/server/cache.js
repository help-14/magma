// @ts-nocheck
export function createCache(defaultTTL = 60_000, maxSize = 100) {
	const store = new Map()
	const order = []

	function touch(key) {
		const i = order.indexOf(key)
		if (i !== -1) order.splice(i, 1)
		order.push(key)
	}

	function evict() {
		while (order.length > maxSize) {
			const key = order.shift()
			store.delete(key)
		}
	}

	return {
		get(key) {
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
		set(key, data, ttl) {
			store.set(key, { data, ts: Date.now(), ttl: ttl ?? defaultTTL })
			touch(key)
			evict()
		},
		delete(key) {
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
