import assert from 'node:assert/strict'
import test from 'node:test'

import { selectTextOnDoubleClick } from './select-text-on-double-click.js'

test('selects all text on double click for text controls', () => {
  let selected = false
  const event = {
    currentTarget: {
      select() {
        selected = true
      }
    }
  }

  selectTextOnDoubleClick(event)

  assert.equal(selected, true)
})

test('calls an existing double click handler after selecting text', () => {
  /** @type {string[]} */
  let calls = []
  const event = {
    currentTarget: {
      select() {
        calls.push('select')
      }
    }
  }

  selectTextOnDoubleClick(event, () => calls.push('handler'))

  assert.deepEqual(calls, ['select', 'handler'])
})
