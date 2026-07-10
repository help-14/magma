import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(
  new URL('./DashboardWidgetFrame.svelte', import.meta.url),
  'utf8'
)

test('DashboardWidgetFrame owns an optional refresh button', () => {
  assert.match(source, /let refreshHandler = \$state<RefreshHandler \| null>\(null\)/)
  assert.match(source, /\{#if refreshHandler && !editMode\}/)
  assert.match(source, /title="Refresh"/)
})
