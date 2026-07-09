<script lang="ts">
  import { Search } from '@lucide/svelte'
  import { m } from '$lib/paraglide/messages.js'
  import { Input } from '$lib/components/ui/input/index.js'
  import { searchIcons } from '$lib/remotes/icons.remote.js'
  import DashboardIcon from './DashboardIcon.svelte'
  import type { IconPickerProps } from '$lib/types/widget.js'

  let { value = '', onSelect = () => {} }: IconPickerProps = $props()

  let searchText = $state(value || '')
  let results = $state<string[]>([])
  let loading = $state(false)
  let open = $state(false)

  $effect(() => {
    searchText = value || ''
  })

  $effect(() => {
    const term = searchText.trim()
    if (!open) return

    let cancelled = false
    loading = true
    const timeout = setTimeout(() => {
      searchIcons({ term })
        .then((icons) => {
          if (!cancelled) results = icons
        })
        .catch(() => {
          if (!cancelled) results = []
        })
        .finally(() => {
          if (!cancelled) loading = false
        })
    }, 180)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  })

  function update(value: string) {
    searchText = value
    open = true
    onSelect(value)
  }

  function choose(icon: string) {
    searchText = icon
    open = false
    onSelect(icon)
  }

  function inputValue(event: Event) {
    return (event.currentTarget as HTMLInputElement).value
  }
</script>

<div class="relative">
  <div class="relative flex items-center">
    <Search
      size={15}
      class="absolute left-2.5 z-1 text-accent pointer-events-none"
    />
    <Input
      class="pl-8"
      value={searchText}
      placeholder="Search Iconify, e.g. docker or simple-icons:docker"
      onfocus={() => (open = true)}
      oninput={(event: Event) => update(inputValue(event))}
      onkeydown={(event: KeyboardEvent) => {
        if (event.key === 'Escape') open = false
      }}
    />
  </div>

  {#if open}
    <div
      class="absolute top-full mt-1.5 left-0 right-0 z-35 grid max-h-64 overflow-auto border border-border rounded-lg bg-[rgb(20_18_16/96%)] shadow-[0_18px_48px_rgb(0_0_0/36%)] backdrop-blur-xl"
    >
      {#if loading}
        <div
          class="flex items-center gap-2.5 w-full min-h-9 border-0 border-b border-b-[rgb(246_236_210/8%)] bg-transparent text-muted-foreground p-2 px-2.5 cursor-default last:border-b-0"
        >
          {m.icon_picker_searching()}
        </div>
      {:else if results.length === 0}
        <button
          type="button"
          class="flex items-center gap-2.5 w-full min-h-9 border-0 border-b border-b-[rgb(246_236_210/8%)] bg-transparent text-foreground p-2 px-2.5 text-left cursor-pointer last:border-b-0 hover:bg-accent/16"
          onclick={() => choose(searchText)}
        >
          <DashboardIcon name={searchText} size={18} />
          <span class="overflow-hidden text-ellipsis whitespace-nowrap"
            >{m.icon_picker_use({ icon: searchText || 'icon' })}</span
          >
        </button>
      {:else}
        {#each results as icon (icon)}
          <button
            type="button"
            class={(icon === value ? 'bg-accent/16 ' : '') +
              'flex items-center gap-2.5 w-full min-h-9 border-0 border-b border-b-[rgb(246_236_210/8%)] bg-transparent text-foreground p-2 px-2.5 text-left cursor-pointer last:border-b-0 hover:bg-accent/16'}
            onclick={() => choose(icon)}
          >
            <DashboardIcon name={icon} size={18} />
            <span class="overflow-hidden text-ellipsis whitespace-nowrap"
              >{icon}</span
            >
          </button>
        {/each}
      {/if}
    </div>
  {/if}
</div>
