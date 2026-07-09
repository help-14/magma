export type DashboardGridConfig = {
  columns?: number
  rows?: number
  cellWidth?: number
  cellHeight?: number
  mobileScale?: number
}

export type ResolvedDashboardGridConfig = {
  columns: number
  rows: number
  cellWidth?: number
  cellHeight?: number
  mobileScale?: number
}

export function defaultDashboardGrid(): ResolvedDashboardGridConfig {
  return {
    columns: 12,
    rows: 6,
    cellWidth: 20,
    cellHeight: 20,
    mobileScale: 0.75
  }
}

export function mergeDashboardGrid(
  grid: DashboardGridConfig = {}
): ResolvedDashboardGridConfig {
  return {
    columns: grid.columns ?? 12,
    rows: grid.rows ?? 8,
    cellWidth: grid.cellWidth,
    cellHeight: grid.cellHeight,
    mobileScale: grid.mobileScale ?? 0.75
  }
}

export function validateDashboardGrid(grid: DashboardGridConfig, path: string) {
  if (
    grid.columns !== undefined &&
    (!Number.isInteger(grid.columns) || grid.columns < 1)
  ) {
    throw new Error(`${path}.columns must be a positive integer.`)
  }
  if (
    grid.rows !== undefined &&
    (!Number.isInteger(grid.rows) || grid.rows < 1)
  ) {
    throw new Error(`${path}.rows must be a positive integer.`)
  }
  if (
    grid.cellWidth !== undefined &&
    (!Number.isInteger(grid.cellWidth) || grid.cellWidth < 1)
  ) {
    throw new Error(`${path}.cellWidth must be a positive integer.`)
  }
  if (
    grid.cellHeight !== undefined &&
    (!Number.isInteger(grid.cellHeight) || grid.cellHeight < 1)
  ) {
    throw new Error(`${path}.cellHeight must be a positive integer.`)
  }
  if (
    grid.mobileScale !== undefined &&
    (typeof grid.mobileScale !== 'number' ||
      !Number.isFinite(grid.mobileScale) ||
      grid.mobileScale < 0.4 ||
      grid.mobileScale > 1)
  ) {
    throw new Error(`${path}.mobileScale must be a number between 0.4 and 1.`)
  }
}
