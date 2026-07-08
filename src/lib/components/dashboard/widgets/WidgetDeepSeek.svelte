<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js'
  import { Progress } from '$lib/components/ui/progress/index.js'
  import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    Provider as TooltipProvider
  } from '$lib/components/ui/tooltip/index.js'
  import { deepseekSummary } from '$lib/remotes/deepseek.remote.js'
  import WidgetTitleBar from './WidgetTitleBar.svelte'
  import WidgetRefreshButton from './WidgetRefreshButton.svelte'
  import WidgetStateWrapper from './WidgetStateWrapper.svelte'
  import type { DeepSeekWidgetProps } from '$lib/types/widget.js'

  let { widget }: DeepSeekWidgetProps = $props()

  let widgetState: 'idle' | 'loading' | 'error' | 'content' = $state('idle')
  let errorMsg = $state('')
  let data: any = $state(null)

  let refreshInterval = $derived(widget.config?.refreshInterval ?? 600)
  let authToken = $derived(widget.config?.authToken || '')

  let walletDisplay = $derived.by(() => {
    if (!data?.normal_wallets) return ''
    const usd = data.normal_wallets.find((w: any) => w.currency === 'USD')
    const cny = data.normal_wallets.find((w: any) => w.currency === 'CNY')
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
    widgetState = 'loading'
    errorMsg = ''
    try {
      const result = await deepseekSummary({ authToken })
      if (!result.ok) {
        widgetState = 'error'
        errorMsg = result.error
        return
      }
      data = result.data
      widgetState = 'content'
    } catch (err) {
      widgetState = 'error'
      errorMsg = err instanceof Error ? err.message : String(err)
    }
  }

  $effect(() => {
    if (!authToken) {
      widgetState = 'idle'
      data = null
      return
    }
    doFetch()
    const id = setInterval(doFetch, refreshInterval * 1000)
    return () => clearInterval(id)
  })
</script>

<div class="relative flex flex-col w-full min-w-0 min-h-0 h-full">
  <WidgetTitleBar title={widget.title} />
  <WidgetStateWrapper
    state={widgetState}
    {errorMsg}
    idleMessage="Configure Auth Token in properties"
  >
    {#snippet children()}
      <div class="flex flex-col gap-2 justify-center h-full p-3">
        <div class="text-lg font-bold tabular-nums">
          {walletDisplay}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              class="flex items-center gap-2 w-full cursor-default"
            >
              <Progress value={progressValue} class="h-2 flex-1" />
              <span class="text-xs text-magma-muted tabular-nums w-8 text-right"
                >{progressValue}%</span
              >
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              class="bg-magma-panel-strong border-magma-line shadow-[0_12px_40px_rgb(0_0_0/40%)] backdrop-blur-xl ring-0 text-xs leading-relaxed text-foreground"
              arrowClasses="bg-magma-panel-strong fill-magma-panel-strong border-magma-line"
            >
              {tooltipText}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    {/snippet}
  </WidgetStateWrapper>
  <WidgetRefreshButton onclick={doFetch} />
</div>
