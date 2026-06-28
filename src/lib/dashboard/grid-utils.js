/**
 * @param {MouseEvent|PointerEvent|DragEvent} event
 * @param {HTMLElement} canvasElement
 * @param {number} pageCenter
 * @param {number} cellSize
 * @param {number} cellHeight
 * @returns {{ x: number, y: number }}
 */
export function cellFromEvent(event, canvasElement, pageCenter, cellSize, cellHeight) {
  const rect = canvasElement.getBoundingClientRect()
  return {
    x: Math.floor((event.clientX - pageCenter) / cellSize),
    y: Math.max(1, Math.floor((event.clientY - rect.top) / cellHeight) + 1)
  }
}

/**
 * @param {{ x: number, y: number, w: number, h: number }} a
 * @param {{ x: number, y: number, w: number, h: number }} b
 * @returns {boolean}
 */
export function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

/**
 * @param {{ x: number, y: number, w: number, h: number, id?: string }} candidate
 * @param {{ x: number, y: number, w: number, h: number, id: string }[]} widgets
 * @param {string} [ignoreId]
 * @returns {boolean}
 */
export function canPlace(candidate, widgets, ignoreId = candidate.id) {
  if (candidate.y < 1 || candidate.w < 1 || candidate.h < 1) return false
  return widgets.every(
    (widget) => widget.id === ignoreId || !overlaps(candidate, widget)
  )
}

/**
 * @param {number} pageCenter
 * @param {number} x
 * @param {number} cellSize
 * @returns {string}
 */
export function widgetLeft(pageCenter, x, cellSize) {
  return `${pageCenter + x * cellSize}px`
}

/**
 * @param {number} y
 * @param {number} cellHeight
 * @returns {string}
 */
export function widgetTop(y, cellHeight) {
  return `${(y - 1) * cellHeight}px`
}

/**
 * @param {{ x: number, y: number, w: number, h: number }} widget
 * @param {number} pageCenter
 * @param {number} cellSize
 * @param {number} cellHeight
 * @returns {string}
 */
export function widgetStyle(widget, pageCenter, cellSize, cellHeight) {
  return [
    `left: ${pageCenter + widget.x * cellSize}px`,
    `top: ${(widget.y - 1) * cellHeight}px`,
    `width: ${widget.w * cellSize}px`,
    `height: ${widget.h * cellHeight}px`
  ].join(';')
}

/**
 * @param {string} type
 * @returns {string}
 */
export function makeId(type) {
  return `${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

/**
 * @param {{ x: number, y: number }} dropCell
 * @param {{ w: number, h: number, config?: any, children?: any[] }} template
 * @param {{ x: number, y: number, w: number, h: number, id: string }[]} widgets
 * @param {number} scanRange
 * @returns {{ x: number, y: number }|null}
 */
export function findNearestFreePosition(dropCell, template, widgets, scanRange = 20) {
  let bestPos = null
  let bestDist = Infinity

  for (let dy = 0; dy <= scanRange; dy++) {
    for (let dx = -scanRange; dx <= scanRange; dx++) {
      const x = dropCell.x + dx
      const y = Math.max(1, dropCell.y + dy)
      const candidate = { x, y, w: template.w, h: template.h }
      if (canPlace(candidate, widgets)) {
        const dist = Math.abs(dx) + Math.abs(dy)
        if (dist < bestDist) {
          bestDist = dist
          bestPos = { x, y }
        }
      }
    }
  }

  return bestPos
}
