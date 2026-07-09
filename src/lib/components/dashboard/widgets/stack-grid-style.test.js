import assert from 'node:assert/strict'
import test from 'node:test'

import { buildStackGridStyle } from './stack-grid-style.js'

test('stack with explicit rows uses equal-height row tracks', () => {
  assert.equal(
    buildStackGridStyle({ flow: 'vertical', cols: 1, rows: 4, gap: 12 }),
    'display: grid; grid-template-columns: repeat(1, minmax(0, 1fr)); grid-template-rows: repeat(4, minmax(0, 1fr)); grid-auto-rows: minmax(0, 1fr); gap: 12px;'
  )
})

test('horizontal stack with explicit rows also uses equal-height row tracks', () => {
  assert.equal(
    buildStackGridStyle({ flow: 'horizontal', cols: 2, rows: 4, gap: 12 }),
    'display: grid; grid-template-rows: repeat(4, minmax(0, 1fr)); grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); gap: 12px;'
  )
})
