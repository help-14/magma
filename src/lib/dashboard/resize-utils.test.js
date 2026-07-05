// @ts-nocheck
import assert from 'node:assert/strict'
import test from 'node:test'

import { resizePatchForDirection } from './resize-utils.ts'

test('left resize keeps the right edge anchored', () => {
	assert.deepEqual(
		resizePatchForDirection(
			{ x: 2, y: 1, w: 4, h: 3 },
			{ dx: -2, dy: 0 },
			'left'
		),
		{ x: 0, w: 6 }
	)
})

test('left resize cannot shrink below one cell', () => {
	assert.deepEqual(
		resizePatchForDirection(
			{ x: 2, y: 1, w: 4, h: 3 },
			{ dx: 8, dy: 0 },
			'left'
		),
		{ x: 5, w: 1 }
	)
})

test('right resize changes only width', () => {
	assert.deepEqual(
		resizePatchForDirection(
			{ x: 2, y: 1, w: 4, h: 3 },
			{ dx: 3, dy: 0 },
			'right'
		),
		{ w: 7 }
	)
})

test('bottom resize changes only height', () => {
	assert.deepEqual(
		resizePatchForDirection(
			{ x: 2, y: 1, w: 4, h: 3 },
			{ dx: 0, dy: 2 },
			'bottom'
		),
		{ h: 5 }
	)
})
