<script lang="ts">
  import { m } from '$lib/paraglide/messages.js'
  import { toErrorMessage } from '$lib/errors.js'
  import { TrendingUp, TrendingDown, Minus } from '@lucide/svelte'
  import { fetchStocks } from '$lib/remotes/stocks.remote.js'
  import { getWidgetRefreshContext } from '$lib/components/dashboard/widget-refresh-context.js'
  import WidgetStateWrapper from './WidgetStateWrapper.svelte'
  import type { StockWidgetProps } from '$lib/types/widget.js'

  let { widget, compact = false }: StockWidgetProps = $props()
  const refreshContext = getWidgetRefreshContext()

  let widgetState: 'idle' | 'loading' | 'error' | 'content' = $state('idle')
  let errorMsg = $state('')
  let stocks: any[] = $state([])
  let feedErrors: any[] = $state([])

  let stocksText = $derived(widget.config?.stocks || '')
  let sortBy = $derived(widget.config?.sortBy || 'default')
  let cacheTime = $derived(widget.config?.cacheTime ?? 300)
  let refreshInterval = $derived(widget.config?.refreshInterval ?? cacheTime)

  let hasStocks = $derived(stocksText.trim().length > 0)

  async function doFetch() {
    if (!hasStocks) return
    widgetState = 'loading'
    errorMsg = ''
    try {
      const result = await fetchStocks({
        stocks: stocksText,
        sortBy: sortBy as any,
        cacheTime
      })
      stocks = result.stocks || []
      feedErrors = result.errors || []
      widgetState = 'content'
    } catch (err) {
      widgetState = 'error'
      errorMsg = err instanceof Error ? err.message : String(err)
    }
  }

  $effect(() => {
    if (!hasStocks) {
      widgetState = 'idle'
      stocks = []
      return
    }
    doFetch()
    const id = setInterval(doFetch, refreshInterval * 1000)
    return () => clearInterval(id)
  })

  $effect(() => {
    refreshContext?.registerRefresh(widget.id, doFetch)
    return () => refreshContext?.registerRefresh(widget.id, null)
  })

  function formatPrice(price: number | null | undefined) {
    if (price == null) return '—'
    if (price >= 1000)
      return price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    if (price >= 1) return price.toFixed(2)
    return price.toFixed(4)
  }

  function formatChange(val: number | null | undefined) {
    if (val == null) return '—'
    const sign = val >= 0 ? '+' : ''
    return sign + val.toFixed(2)
  }

  function formatChangePercent(val: number | null | undefined) {
    if (val == null) return '—'
    const sign = val >= 0 ? '+' : ''
    return sign + val.toFixed(2) + '%'
  }

  function sparklinePath(chart: number[]) {
    if (!chart || chart.length < 2) return ''
    const w = 60,
      h = 24
    const min = Math.min(...chart)
    const max = Math.max(...chart)
    const range = max - min || 1
    const padding = range * 0.08
    const yMin = min - padding
    const yMax = max + padding
    const yRange = yMax - yMin || 1
    const step = w / (chart.length - 1)
    return chart
      .map((v: number, i: number) => {
        const x = i * step
        const y = h - ((v - yMin) / yRange) * h
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  }
</script>

<div
  class="relative flex flex-col w-full min-w-0 min-h-0 h-full overflow-hidden"
>
  <WidgetStateWrapper
    state={widgetState}
    {errorMsg}
    idleMessage={m.widget_state_configure()}
  >
    {#snippet children()}
      {#if feedErrors.length > 0}
        <div
          class="flex items-center gap-1 px-3 pt-1 pb-0 text-amber-400 text-xs cursor-help"
          title={feedErrors
            .map((e: any) => `${e.symbol}: ${toErrorMessage(e.message)}`)
            .join('\n')}
        >
          <span>⚠</span>
          <span class="truncate">{m.stock_feed_errors({ count: feedErrors.length })}</span>
        </div>
      {/if}
      <div class="flex-1 overflow-y-auto min-h-0 px-1 pb-1">
        {#each stocks as stock (stock.symbol)}
          <div
            class="flex items-center px-2 py-1.5 rounded hover:bg-white/5 transition-colors"
          >
            <div class="flex-1 min-w-0">
              <div class="text-foreground text-xs font-medium truncate">
                {stock.symbol}
              </div>
              {#if !compact && stock.name !== stock.symbol}
                <div class="text-muted-foreground text-[10px] truncate">
                  {stock.name}
                </div>
              {/if}
            </div>
            {#if !compact && stock.chart?.length >= 2}
              <div class="shrink-0 ml-2">
                <svg width="60" height="24" viewBox="0 0 60 24" class="block">
                  <path
                    d={sparklinePath(stock.chart)}
                    fill="none"
                    stroke={stock.change >= 0 ? '#4ade80' : '#f87171'}
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            {/if}
            <div
              class="text-right m-2 shrink-0 text-foreground text-xs font-medium tabular-nums"
            >
              {formatPrice(stock.price)}
            </div>
            <div class="text-right ml-1 shrink-0 min-w-14">
              {#if stock.change != null}
                {#if stock.change > 0}
                  <div
                    class="flex items-center gap-0.5 justify-end text-green-400"
                  >
                    <TrendingUp class="size-3" />
                    <span class="text-xs tabular-nums"
                      >{formatChange(stock.change)}</span
                    >
                  </div>
                  <div
                    class="text-[10px] text-green-400/80 tabular-nums text-right"
                  >
                    {formatChangePercent(stock.changePercent)}
                  </div>
                {:else if stock.change < 0}
                  <div
                    class="flex items-center gap-0.5 justify-end text-red-400"
                  >
                    <TrendingDown class="size-3" />
                    <span class="text-xs tabular-nums"
                      >{formatChange(stock.change)}</span
                    >
                  </div>
                  <div
                    class="text-[10px] text-red-400/80 tabular-nums text-right"
                  >
                    {formatChangePercent(stock.changePercent)}
                  </div>
                {:else}
                  <div
                    class="flex items-center gap-0.5 justify-end text-muted-foreground"
                  >
                    <Minus class="size-3" />
                    <span class="text-xs tabular-nums">0.00</span>
                  </div>
                  <div
                    class="text-[10px] text-muted-foreground tabular-nums text-right"
                  >
                    0.00%
                  </div>
                {/if}
              {:else}
                <div class="text-muted-foreground text-xs">—</div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/snippet}
  </WidgetStateWrapper>

</div>
