export type GridRect = { x: number; y: number; w: number; h: number }
export type ResizeDelta = { dx: number; dy: number }
export type ResizeDirection = 'left' | 'right' | 'bottom'

export function resizePatchForDirection(
  original: GridRect,
  delta: ResizeDelta,
  direction: ResizeDirection
): Partial<GridRect> {
  if (direction === 'left') {
    const width = Math.max(1, original.w - delta.dx)
    return {
      x: original.x + original.w - width,
      w: width
    }
  }

  if (direction === 'right') {
    return { w: Math.max(1, original.w + delta.dx) }
  }

  return { h: Math.max(1, original.h + delta.dy) }
}
