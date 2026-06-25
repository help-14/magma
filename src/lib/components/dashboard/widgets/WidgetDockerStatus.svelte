<script>
  // @ts-nocheck
  import {
    listContainers,
    startContainer,
    stopContainer,
    restartContainer
  } from '$lib/remotes/docker.remote.js'
  import { toast } from 'svelte-sonner'
  import {
    Container,
    Play,
    Square,
    RotateCw,
    ExternalLink
  } from '@lucide/svelte'

  let { widget, compact = false } = $props()
  let containers = $state([])
  let loading = $state(true)
  let error = $state(null)
  let contextMenu = $state(null)

  let dockerHost = $derived(widget.config?.dockerHost || '')
  let hideOffline = $derived(widget.config?.hideOffline ?? false)

  let filtered = $derived(
    containers
      .filter((c) => !hideOffline || c.State === 'running')
      .sort((a, b) => {
        if (a.State === 'running' && b.State !== 'running') return -1
        if (a.State !== 'running' && b.State === 'running') return 1
        const aName = (a.Names?.[0] || a.Id || '').replace(/^\//, '')
        const bName = (b.Names?.[0] || b.Id || '').replace(/^\//, '')
        return aName.localeCompare(bName)
      })
  )

  async function fetchContainers() {
    if (!dockerHost) {
      loading = false
      containers = []
      return
    }
    loading = true
    error = null
    try {
      containers = await listContainers({ dockerHost, all: true })
    } catch (e) {
      error = e.message
      containers = []
    } finally {
      loading = false
    }
  }

  $effect(() => {
    dockerHost
    fetchContainers()
  })

  function getHostname(url) {
    try {
      return new URL(url).hostname
    } catch {
      return url
    }
  }

  function containerUrl(c) {
    const hostname = getHostname(dockerHost)
    const port = c.Ports?.find((p) => p.PublicPort)
    if (port && port.PublicPort) {
      return `http://${hostname}:${port.PublicPort}`
    }
    return null
  }

  function clickContainer(c) {
    const url = containerUrl(c)
    if (url) {
      window.open(url, '_blank', 'noreferrer')
    }
  }

  function openContextMenu(event, c) {
    event.preventDefault()
    event.stopPropagation()
    contextMenu = {
      container: c,
      x: event.clientX,
      y: event.clientY
    }
  }

  function closeContextMenu() {
    contextMenu = null
  }

  async function operate(operation) {
    if (!contextMenu) return
    const { container } = contextMenu
    const id = container.Id
    closeContextMenu()

    try {
      let ok = false
      if (operation === 'start') {
        ok = await startContainer({ dockerHost, containerId: id })
      } else if (operation === 'stop') {
        ok = await stopContainer({ dockerHost, containerId: id })
      } else if (operation === 'restart') {
        ok = await restartContainer({ dockerHost, containerId: id })
      }
      if (ok) {
        toast.success(`Container ${operation} successful`)
        fetchContainers()
      } else {
        toast.error(`Container ${operation} failed`)
      }
    } catch (e) {
      toast.error(`Container ${operation} failed: ${e.message}`)
    }
  }

  function displayName(c) {
    return (c.Names?.[0] || c.Id || '').replace(/^\//, '')
  }

  function shortId(c) {
    return (c.Id || '').slice(0, 12)
  }

  function portSummary(c) {
    return (c.Ports || [])
      .filter((p) => p.PublicPort)
      .map((p) => `${p.PublicPort}:${p.PrivatePort}/${p.Type}`)
      .join(', ')
  }
</script>

<svelte:window onclick={closeContextMenu} />

<div class="flex flex-col w-full min-w-0 min-h-0 h-full justify-center">
  {#if !dockerHost}
    <div
      class="flex flex-col justify-center items-center gap-2 p-4 text-magma-muted"
    >
      <Container size={28} class="text-magma-accent shrink-0" />
      <strong>{widget.title}</strong>
      <span class="text-magma-muted text-center"
        >Configure Docker host in properties</span
      >
    </div>
  {:else if loading}
    <div class="flex flex-wrap gap-2 p-3 w-full">
      {#each Array(6) as _}
        <div
          class="flex-1 min-w-24 h-14 rounded-lg bg-magma-accent/8 animate-pulse"
        ></div>
      {/each}
    </div>
  {:else if error}
    <div
      class="flex flex-col justify-center items-center gap-1 p-4 text-magma-muted text-xs"
    >
      <Container size={24} class="text-magma-accent shrink-0" />
      <span>Connection error</span>
      <span class="text-xs opacity-60">{error}</span>
    </div>
  {:else}
    <div class="flex flex-wrap gap-1.5 p-2 w-full h-full items-center">
      {#each filtered as c}
        <button
          class="relative flex flex-col gap-0.5 px-2.5 py-1.5 rounded-lg bg-magma-accent/6 border border-magma-line/40 text-magma-text text-left text-xs leading-snug cursor-pointer transition-all duration-100 hover:bg-magma-accent/12 hover:border-magma-accent/30 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-magma-accent"
          onclick={() => clickContainer(c)}
          oncontextmenu={(e) => openContextMenu(e, c)}
        >
          <span
            class="flex items-center gap-1.5 font-semibold truncate max-w-36"
          >
            <span
              class="inline-block size-1.5 rounded-full shrink-0"
              class:bg-[#6bda6b]={c.State === 'running'}
              class:bg-[#da6b6b]={c.State !== 'running'}
            ></span>
            {displayName(c)}
          </span>
          {#if containerUrl(c)}
            <span class="flex items-center gap-1 text-magma-accent text-xs">
              <ExternalLink size={10} />
              {portSummary(c)}
            </span>
          {:else}
            <span class="text-magma-muted/60 text-xs">{shortId(c)}</span>
          {/if}
        </button>
      {/each}
      {#if filtered.length === 0}
        <span class="w-full text-center text-magma-muted text-xs py-4"
          >No containers</span
        >
      {/if}
    </div>
  {/if}
</div>

{#if contextMenu}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    role="menu"
    class="fixed z-50 min-w-32 py-1 rounded-lg bg-[rgb(30_26_22/96%)] border border-magma-line shadow-[0_12px_40px_rgb(0_0_0/45%)] backdrop-blur-lg text-xs"
    style={`left: ${contextMenu.x}px; top: ${contextMenu.y}px`}
    onclick={closeContextMenu}
    oncontextmenu={(e) => e.preventDefault()}
  >
    <div
      class="px-2.5 py-1.5 text-magma-muted text-xs font-bold truncate border-b border-magma-line/30"
    >
      {displayName(contextMenu.container)}
    </div>
    <button
      class="flex items-center gap-2 w-full px-2.5 py-1.5 text-left bg-transparent border-0 text-magma-text cursor-pointer transition-colors hover:bg-magma-accent/10 disabled:opacity-30 disabled:cursor-default"
      disabled={contextMenu.container.State === 'running'}
      onclick={() => operate('start')}
    >
      <Play size={13} /> Start
    </button>
    <button
      class="flex items-center gap-2 w-full px-2.5 py-1.5 text-left bg-transparent border-0 text-magma-text cursor-pointer transition-colors hover:bg-magma-accent/10 disabled:opacity-30 disabled:cursor-default"
      disabled={contextMenu.container.State !== 'running'}
      onclick={() => operate('stop')}
    >
      <Square size={13} /> Stop
    </button>
    <button
      class="flex items-center gap-2 w-full px-2.5 py-1.5 text-left bg-transparent border-0 text-magma-text cursor-pointer transition-colors hover:bg-magma-accent/10"
      onclick={() => operate('restart')}
    >
      <RotateCw size={13} /> Restart
    </button>
  </div>
{/if}
