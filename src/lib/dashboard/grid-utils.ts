type GridRect = { x: number; y: number; w: number; h: number }
type GridWidget = GridRect & { id: string }
type DropCell = { x: number; y: number }
type WidgetTemplate = { w: number; h: number; config?: unknown; children?: unknown[] }
export type WidgetBounds = { minX: number; maxX: number; maxY: number }
export type MobileCanvasMetrics = { width: number; height: number; pageCenter: number }

export function cellFromEvent(
  event: MouseEvent | PointerEvent | DragEvent,
  canvasElement: HTMLElement,
  pageCenter: number,
  cellSize: number,
  cellHeight: number
): DropCell {
	const rect = canvasElement.getBoundingClientRect()
	return {
		x: Math.floor((event.clientX - rect.left - pageCenter) / cellSize),
		y: Math.max(1, Math.floor((event.clientY - rect.top) / cellHeight) + 1)
	}
}

export function overlaps(a: GridRect, b: GridRect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

export function canPlace(candidate: GridRect & { id?: string }, widgets: GridWidget[], ignoreId = candidate.id): boolean {
  if (candidate.y < 1 || candidate.w < 1 || candidate.h < 1) return false
  return widgets.every(
    (widget) => widget.id === ignoreId || !overlaps(candidate, widget)
  )
}

export function widgetLeft(pageCenter: number, x: number, cellSize: number): string {
  return `${pageCenter + x * cellSize}px`
}

export function widgetTop(y: number, cellHeight: number): string {
  return `${(y - 1) * cellHeight}px`
}

export function widgetStyle(widget: GridRect, pageCenter: number, cellSize: number, cellHeight: number): string {
  return [
    `left: ${pageCenter + widget.x * cellSize}px`,
    `top: ${(widget.y - 1) * cellHeight}px`,
    `width: ${widget.w * cellSize}px`,
    `height: ${widget.h * cellHeight}px`
  ].join(';')
}

export function getWidgetBounds(widgets: GridRect[]): WidgetBounds {
  if (widgets.length === 0) return { minX: 0, maxX: 0, maxY: 1 }

  return {
    minX: Math.min(...widgets.map((widget) => widget.x)),
    maxX: Math.max(...widgets.map((widget) => widget.x + widget.w)),
    maxY: Math.max(...widgets.map((widget) => widget.y + widget.h - 1))
  }
}

export function mobileCanvasMetrics({
  bounds,
  cellWidth,
  cellHeight,
  viewWidth,
  viewHeight,
  paddingCells = 2
}: {
  bounds: WidgetBounds
  cellWidth: number
  cellHeight: number
  viewWidth: number
  viewHeight: number
  paddingCells?: number
}): MobileCanvasMetrics {
  const width = Math.max(
    viewWidth,
    (bounds.maxX - bounds.minX + paddingCells * 2) * cellWidth
  )
  const height = Math.max(
    viewHeight,
    (bounds.maxY + paddingCells * 2) * cellHeight
  )
  const pageCenter = (-bounds.minX + paddingCells) * cellWidth

  return { width, height, pageCenter }
}

export function makeId(type: string): string {
  return `${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function findNearestFreePosition(
  dropCell: DropCell,
  template: WidgetTemplate,
  widgets: GridWidget[],
  scanRange = 20
): DropCell | null {
  let bestPos: DropCell | null = null
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
