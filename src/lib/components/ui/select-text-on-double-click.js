/**
 * @param {{ currentTarget: { select?: () => void } }} event
 * @param {(event: any) => void} [handler]
 */
export function selectTextOnDoubleClick(event, handler) {
  event.currentTarget.select?.()
  handler?.(event)
}
