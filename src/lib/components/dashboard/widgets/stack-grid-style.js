/**
 * @param {{ flow: string, cols: number, rows: number, gap: number }} config
 */
export function buildStackGridStyle({ flow, cols, rows, gap }) {
  if (flow === 'horizontal' && rows > 0) {
    return `display: grid; grid-template-rows: repeat(${rows}, minmax(0, 1fr)); grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); gap: ${gap}px;`
  }

  if (rows > 0) {
    return `display: grid; grid-template-columns: repeat(${cols}, minmax(0, 1fr)); grid-template-rows: repeat(${rows}, minmax(0, 1fr)); grid-auto-rows: minmax(0, 1fr); gap: ${gap}px;`
  }

  return `display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: ${gap}px;`
}
