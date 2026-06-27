<script>
  // @ts-nocheck
  import { Server, Clock, Cpu, HardDrive, Database } from '@lucide/svelte'
  import { fetchServerStatus } from '$lib/remotes/server-status.remote.js'
  import WidgetTitleBar from './WidgetTitleBar.svelte'
  import WidgetRefreshButton from './WidgetRefreshButton.svelte'
  import WidgetStateWrapper from './WidgetStateWrapper.svelte'

  /** @type {import('$lib/types/widget.js').ServerStatusWidgetProps} */
  let { widget, compact = false } = $props()

  let state = $state('idle')
  let errorMsg = $state('')
  let data = $state(null)

  let hasConfig = $derived((widget.config?.sshCmd || '').trim().length > 0)
  let refreshInterval = $derived(widget.config?.refreshInterval ?? 60)

  let showHostname = $derived(widget.config?.showHostname !== false)
  let showUptime = $derived(widget.config?.showUptime !== false)
  let showCpu = $derived(widget.config?.showCpu !== false)
  let showRam = $derived(widget.config?.showRam !== false)
  let showDisk = $derived(widget.config?.showDisk !== false)

  async function doFetch() {
    if (!hasConfig) return
    state = 'loading'
    errorMsg = ''
    try {
      data = await fetchServerStatus({ sshCmd: widget.config.sshCmd })
      state = 'content'
    } catch (err) {
      state = 'error'
      errorMsg = err.message || String(err)
    }
  }

  $effect(() => {
    if (!hasConfig) {
      state = 'idle'
      data = null
      return
    }
    doFetch()
    const id = setInterval(doFetch, refreshInterval * 1000)
    return () => clearInterval(id)
  })

  function ramPct() {
    if (!data) return 0
    return Math.round(
      (parseInt(data.ramUsed) / Math.max(parseInt(data.ramTotal), 1)) * 100
    )
  }

  function diskPct() {
    if (!data) return 0
    return parseInt(data.diskUsePct) || 0
  }
</script>

<div
  class="relative flex flex-col w-full min-w-0 min-h-0 h-full overflow-hidden"
>
  <WidgetTitleBar title={widget.title}>
    {#snippet icon()}
      <Server class="size-4" />
    {/snippet}
  </WidgetTitleBar>

  <WidgetStateWrapper
    {state}
    {errorMsg}
    idleMessage="Configure SSH in properties"
  >
    {#snippet children()}
      {#if data}
        <div
          class="flex-1 overflow-y-auto min-h-0 px-2 pb-1 space-y-1.5 text-xs"
        >
          {#if showHostname && data.hostname}
            <div class="flex items-center gap-2 text-magma-foreground">
              <Server class="size-3.5 text-magma-accent shrink-0" />
              <span class="text-magma-muted">Hostname:</span>
              <span class="font-mono">{data.hostname}</span>
            </div>
          {/if}

          {#if showUptime && data.uptime}
            <div class="flex items-center gap-2 text-magma-foreground">
              <Clock class="size-3.5 text-magma-accent shrink-0" />
              <span class="text-magma-muted">Uptime:</span>
              <span>{data.uptime}</span>
            </div>
          {/if}

          {#if showCpu}
            <div class="flex items-center gap-2 text-magma-foreground">
              <Cpu class="size-3.5 text-magma-accent shrink-0" />
              <span class="text-magma-muted">CPU:</span>
              <span class="font-mono">{data.load}</span>
              <span class="text-magma-muted">({data.cpuCores} cores)</span>
            </div>
          {/if}

          {#if showRam}
            <div class="flex items-center gap-2 text-magma-foreground">
              <HardDrive class="size-3.5 text-magma-accent shrink-0" />
              <span class="text-magma-muted shrink-0">RAM:</span>
              <div
                class="flex-1 h-2 bg-magma-surface rounded-full overflow-hidden"
              >
                <div
                  class="h-full bg-yellow-500 rounded-full transition-all"
                  style="width: {Math.min(ramPct(), 100)}%"
                ></div>
              </div>
              <span class="font-mono shrink-0"
                >{data.ramUsed} / {data.ramTotal} MB</span
              >
            </div>
          {/if}

          {#if showDisk}
            <div class="flex items-center gap-2 text-magma-foreground">
              <Database class="size-3.5 text-magma-accent shrink-0" />
              <span class="text-magma-muted shrink-0">Disk:</span>
              <div
                class="flex-1 h-2 bg-magma-surface rounded-full overflow-hidden"
              >
                <div
                  class="h-full bg-yellow-500 rounded-full transition-all"
                  style="width: {Math.min(diskPct(), 100)}%"
                ></div>
              </div>
              <span class="font-mono shrink-0"
                >{data.diskUsed} / {data.diskTotal} ({data.diskUsePct})</span
              >
            </div>
          {/if}
        </div>
      {/if}
    {/snippet}
  </WidgetStateWrapper>

  <WidgetRefreshButton onclick={doFetch} />
</div>
