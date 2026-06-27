<script>
  // @ts-nocheck
  import { RefreshCw } from '@lucide/svelte'
  import { Button } from '$lib/components/ui/button/index.js'
  import { Progress } from '$lib/components/ui/progress/index.js'
  import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    Provider as TooltipProvider
  } from '$lib/components/ui/tooltip/index.js'
  import { deepseekSummary } from '$lib/remotes/deepseek.remote.js'

  /** @type {import('$lib/types/widget.js').DeepSeekWidgetProps} */
  let { widget, compact = false } = $props()

  let state = $state('idle')
  let errorMsg = $state('')
  let data = $state(null)

  let refreshInterval = $derived(widget.config?.refreshInterval ?? 600)
  let authToken = $derived(widget.config?.authToken || '')

  let walletDisplay = $derived.by(() => {
    if (!data?.normal_wallets) return ''
    const usd = data.normal_wallets.find((w) => w.currency === 'USD')
    const cny = data.normal_wallets.find((w) => w.currency === 'CNY')
    const parts = []
    if (usd) parts.push('$' + parseFloat(usd.balance).toFixed(2))
    if (cny) parts.push('\u00a5' + parseFloat(cny.balance).toFixed(2))
    return parts.join(' + ')
  })

  let progressValue = $derived.by(() => {
    if (!data) return 0
    const total = parseInt(data.total_available_token_estimation, 10)
    const current = parseInt(data.current_token, 10)
    if (!current) return 0
    return Math.round((total / current) * 100)
  })

  let tooltipText = $derived.by(() => {
    if (!data) return ''
    const total = parseInt(
      data.total_available_token_estimation,
      10
    ).toLocaleString()
    const current = parseInt(data.current_token, 10).toLocaleString()
    return `${total} / ${current} tokens`
  })

  async function doFetch() {
    if (!authToken) return
    state = 'loading'
    errorMsg = ''
    try {
      const result = await deepseekSummary({ authToken })
      if (!result.ok) {
        state = 'error'
        errorMsg = result.error
        return
      }
      data = result.data
      state = 'content'
    } catch (err) {
      state = 'error'
      errorMsg = err.message || String(err)
    }
  }

  $effect(() => {
    if (!authToken) {
      state = 'idle'
      data = null
      return
    }
    doFetch()
    const id = setInterval(doFetch, refreshInterval * 1000)
    return () => clearInterval(id)
  })
</script>

<div class="relative flex flex-col w-full min-w-0 min-h-0 h-full p-3">
  <div class="text-magma-accent text-sm font-extrabold shrink-0 mb-2">
    {widget.title}
  </div>

  {#if state === 'idle'}
    <div
      class="flex items-center justify-center h-full text-magma-muted text-xs p-4"
    >
      Configure Auth Token in properties
    </div>
  {:else if state === 'loading'}
    <div class="flex items-center justify-center h-full">
      <RefreshCw class="animate-spin text-magma-muted" size={24} />
    </div>
  {:else if state === 'error'}
    <div
      class="flex items-center justify-center h-full text-red-400 text-xs p-4 text-center"
    >
      {errorMsg}
    </div>
  {:else if state === 'content'}
    <div class="flex flex-col gap-2 justify-center h-full">
      <div class="text-lg font-bold tabular-nums">
        {walletDisplay}
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger class="flex items-center gap-2 w-full cursor-default">
            <Progress value={progressValue} class="h-2 flex-1" />
            <span class="text-xs text-magma-muted tabular-nums w-8 text-right"
              >{progressValue}%</span
            >
          </TooltipTrigger>
          <TooltipContent>
            {tooltipText}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  {/if}

  <Button
    onclick={doFetch}
    variant="ghost"
    class="absolute top-1 right-1 p-1 rounded text-sm aspect-square"
    title="Refresh"
  >
    <RefreshCw class="size-3" />
  </Button>
</div>
