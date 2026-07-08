<script lang="ts">
  import { ExternalLink, ChevronDown, ChevronUp } from '@lucide/svelte'
  import { fetchRss } from '$lib/remotes/rss.remote.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import WidgetTitleBar from './WidgetTitleBar.svelte'
  import WidgetRefreshButton from './WidgetRefreshButton.svelte'
  import WidgetStateWrapper from './WidgetStateWrapper.svelte'
  import type { RssWidgetProps } from '$lib/types/widget.js'

  let { widget, compact = false }: RssWidgetProps = $props()

  let widgetState: 'idle' | 'loading' | 'error' | 'content' = $state('idle')
  let errorMsg = $state('')
  let articles: any[] = $state([])
  let feedErrors: any[] = $state([])
  let collapsed = $state(true)

  let feedsJson = $derived(widget.config?.feeds || '[]')
  let limit = $derived(widget.config?.limit ?? 25)
  let collapseAfter = $derived(widget.config?.collapseAfter ?? 5)
  let singleLineTitles = $derived(widget.config?.singleLineTitles ?? false)
  let preserveOrder = $derived(widget.config?.preserveOrder ?? false)
  let refreshInterval = $derived(widget.config?.refreshInterval ?? 600)

  let hasFeeds = $derived.by(() => {
    try {
      const f = JSON.parse(feedsJson)
      return Array.isArray(f) && f.length > 0
    } catch {
      return false
    }
  })

  let displayedArticles = $derived(
    collapsed ? articles.slice(0, collapseAfter) : articles
  )

  async function doFetch() {
    if (!hasFeeds) return
    widgetState = 'loading'
    errorMsg = ''
    try {
      const result = await fetchRss({
        feeds: feedsJson,
        limit,
        preserveOrder
      })
      articles = result.articles || []
      feedErrors = result.errors || []
      widgetState = 'content'
    } catch (err) {
      widgetState = 'error'
      errorMsg = err instanceof Error ? err.message : String(err)
    }
  }

  $effect(() => {
    if (!hasFeeds) {
      widgetState = 'idle'
      articles = []
      return
    }
    doFetch()
    const id = setInterval(doFetch, refreshInterval * 1000)
    return () => clearInterval(id)
  })

  function timeAgo(dateStr: string) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    const diff = Math.floor((Date.now() - d.getTime()) / 1000)
    if (diff < 60) return 'now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
  }

  function stripHtml(html: string) {
    if (!html) return ''
    return html.replace(/<[^>]*>/g, '').trim()
  }

  function truncate(text: string, len: number) {
    if (!text) return ''
    if (text.length <= len) return text
    return text.slice(0, len) + '…'
  }
</script>

<div
  class="relative flex flex-col w-full min-w-0 min-h-0 h-full overflow-hidden"
>
  <WidgetTitleBar title={widget.title}>
    {#snippet trailing()}
      {#if feedErrors.length > 0}
        <span
          class="text-amber-400 text-xs shrink-0 cursor-help"
          title={feedErrors.map((e: any) => `${e.feedUrl}: ${e.message}`).join('\n')}
        >
          ⚠
        </span>
      {/if}
    {/snippet}
  </WidgetTitleBar>

  <WidgetStateWrapper
    state={widgetState}
    {errorMsg}
    idleMessage="Configure feeds in properties"
  >
    {#snippet children()}
      <div class="flex-1 overflow-y-auto min-h-0 px-1 pb-1 space-y-0.5">
        {#each displayedArticles as article (article.link || article.title)}
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            class="block px-2 py-1.5 rounded hover:bg-white/5 transition-colors group"
          >
            <div class="flex items-start gap-2">
              <div class="flex-1 min-w-0">
                <div
                  class="text-foreground text-xs font-medium leading-tight {singleLineTitles
                    ? 'truncate'
                    : ''}"
                >
                  {article.title}
                </div>
                {#if !compact && article.description}
                  <div
                    class="text-muted-foreground text-[10px] mt-0.5 line-clamp-2 leading-relaxed"
                  >
                    {truncate(stripHtml(article.description), 120)}
                  </div>
                {/if}
                <div class="flex items-center gap-1.5 mt-0.5">
                  {#if article.feedTitle}
                    <span
                      class="text-[10px] text-accent/70 truncate max-w-[100px]"
                      >{article.feedTitle}</span
                    >
                  {/if}
                  {#if article.pubDate}
                    <span class="text-[10px] text-muted-foreground shrink-0"
                      >{timeAgo(article.pubDate)}</span
                    >
                  {/if}
                </div>
              </div>
              <ExternalLink
                class="size-3 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </a>
        {/each}
      </div>
      {#if articles.length > collapseAfter && collapseAfter > 0}
        <div class="shrink-0 px-2 pb-1">
          <Button
            onclick={() => (collapsed = !collapsed)}
            variant="ghost"
            class="w-full text-xs text-accent/70 h-6"
          >
            {collapsed ? 'Show more' : 'Show less'}
            {#if collapsed}
              <ChevronDown class="size-3 ml-1" />
            {:else}
              <ChevronUp class="size-3 ml-1" />
            {/if}
          </Button>
        </div>
      {/if}
    {/snippet}
  </WidgetStateWrapper>

  <WidgetRefreshButton onclick={doFetch} />
</div>
