<script lang="ts">
  import {
    listContainers,
    startContainer,
    stopContainer,
    restartContainer,
  } from "$lib/remotes/docker.remote.js";
  import { toast } from "svelte-sonner";
  import { m } from "$lib/paraglide/messages.js";
  import {
    Container,
    Play,
    Square,
    RotateCw,
    ExternalLink,
    RefreshCw,
  } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import { getWidgetRefreshContext } from "$lib/components/dashboard/widget-refresh-context.js";
  import {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuSeparator,
  } from "$lib/components/ui/context-menu/index.js";
  import type { DockerStatusWidgetProps } from "$lib/types/widget.js";

  let { widget, compact = false }: DockerStatusWidgetProps = $props();
  const refreshContext = getWidgetRefreshContext();

  let widgetState: "idle" | "loading" | "error" | "content" = $state("idle");
  let errorMsg = $state("");
  let containers: any[] = $state([]);

  let dockerHost = $derived(widget.config?.dockerHost || "");
  let hideOffline = $derived(widget.config?.hideOffline ?? false);
  let columns = $derived(widget.config?.columns ?? 4);
  let refreshInterval = $derived(widget.config?.refreshInterval ?? 30);

  let filtered = $derived(
    containers
      .filter((c: any) => !hideOffline || c.State === "running")
      .sort((a: any, b: any) => {
        if (a.State === "running" && b.State !== "running") return -1;
        if (a.State !== "running" && b.State === "running") return 1;
        const aName = (a.Names?.[0] || a.Id || "").replace(/^\//, "");
        const bName = (b.Names?.[0] || b.Id || "").replace(/^\//, "");
        return aName.localeCompare(bName);
      }),
  );

  async function doFetch() {
    if (!dockerHost) {
      widgetState = "idle";
      containers = [];
      return;
    }
    widgetState = "loading";
    errorMsg = "";
    try {
      containers = await listContainers({ dockerHost, all: true });
      widgetState = "content";
    } catch (e) {
      widgetState = "error";
      errorMsg = e instanceof Error ? e.message : String(e);
      containers = [];
    }
  }

  $effect(() => {
    void dockerHost;
    doFetch();
    const id = setInterval(doFetch, refreshInterval * 1000);
    return () => clearInterval(id);
  });

  $effect(() => {
    refreshContext?.registerRefresh(widget.id, doFetch);
    return () => refreshContext?.registerRefresh(widget.id, null);
  });

  function getHostname(url: string) {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  function containerUrl(c: any) {
    const hostname = getHostname(dockerHost);
    const port = c.Ports?.find((p: any) => p.PublicPort);
    if (port && port.PublicPort) {
      return `http://${hostname}:${port.PublicPort}`;
    }
    return null;
  }

  function clickContainer(c: any) {
    const url = containerUrl(c);
    if (url) {
      window.open(url, "_blank", "noreferrer");
    }
  }

  async function operate(operation: string, container: any) {
    const id = container.Id;

    try {
      let ok = false;
      if (operation === "start") {
        ok = await startContainer({ dockerHost, containerId: id });
      } else if (operation === "stop") {
        ok = await stopContainer({ dockerHost, containerId: id });
      } else if (operation === "restart") {
        ok = await restartContainer({ dockerHost, containerId: id });
      }
      if (ok) {
        toast.success(m.docker_operation_success({ operation }));
        doFetch();
      } else {
        toast.error(m.docker_operation_failed({ operation }));
      }
    } catch (e) {
      toast.error(
        m.docker_operation_failed({ operation }) +
          `: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  function displayName(c: any) {
    return (c.Names?.[0] || c.Id || "").replace(/^\//, "");
  }

  function shortId(c: any) {
    return (c.Id || "").slice(0, 12);
  }

  function portSummary(c: any) {
    return (c.Ports || [])
      .filter((p: any) => p.PublicPort)
      .map((p: any) => `${p.PublicPort}:${p.PrivatePort}/${p.Type}`)
      .join(", ");
  }
</script>

<div class="flex flex-col w-full min-w-0 min-h-0 h-full">
  {#if widgetState === "idle"}
    <div
      class="flex flex-col justify-center items-center gap-2 p-4 text-muted-foreground"
    >
      <Container size={28} class="text-accent shrink-0" />
      <span class="text-muted-foreground text-center"
        >{m.docker_configure_host()}</span
      >
    </div>
  {:else if widgetState === "loading"}
    <div class="flex flex-wrap gap-2 p-3 w-full">
      {#each Array(6) as _, i (i)}
        <div
          class="flex-1 min-w-24 h-14 rounded-lg bg-accent/8 animate-pulse"
        ></div>
      {/each}
    </div>
  {:else if widgetState === "error"}
    <div
      class="flex flex-col justify-center h-full items-center text-center gap-1 p-4 text-muted-foreground text-xs"
    >
      <Container size={24} class="text-accent shrink-0" />
      <span>{m.docker_connection_error()}</span>
      <span class="text-xs opacity-60">{errorMsg}</span>
    </div>
  {:else if widgetState === "content"}
    <ScrollArea class="flex-1 min-h-0 w-full">
      <div
        class="grid gap-2 p-2 w-full items-stretch auto-rows-auto"
        style="grid-template-columns: repeat({columns},minmax(0,1fr))"
      >
        {#each filtered as c (c.Id)}
          <ContextMenu>
            <ContextMenuTrigger>
              {#if c.State === "running"}
                <Button
                  variant="magma"
                  size="sm"
                  class="flex-col! items-start! gap-0.5 px-2.5 py-1.5 text-xs leading-snug h-auto min-h-0 w-full"
                  onclick={() => clickContainer(c)}
                >
                  <span
                    class="flex items-center gap-1.5 font-semibold truncate max-w-36"
                  >
                    <span
                      class="inline-block size-1.5 rounded-full shrink-0 bg-green-500"
                    ></span>
                    {displayName(c)}
                  </span>
                  {#if containerUrl(c)}
                    <span class="flex items-center gap-1 text-accent text-xs">
                      <ExternalLink size={10} />
                      {portSummary(c)}
                    </span>
                  {:else}
                    <span class="text-muted-foreground/60 text-xs"
                      >{shortId(c)}</span
                    >
                  {/if}
                </Button>
              {:else}
                <Button
                  variant="outline"
                  size="sm"
                  class="!flex-col !items-start gap-0.5 px-2.5 py-1.5 text-xs leading-snug h-auto min-h-0 w-full"
                  onclick={() => clickContainer(c)}
                >
                  <span
                    class="flex items-center gap-1.5 font-semibold truncate max-w-36"
                  >
                    <span
                      class="inline-block size-1.5 rounded-full shrink-0 bg-red-400"
                    ></span>
                    {displayName(c)}
                  </span>
                  {#if containerUrl(c)}
                    <span class="flex items-center gap-1 text-accent text-xs">
                      <ExternalLink size={10} />
                      {portSummary(c)}
                    </span>
                  {:else}
                    <span class="text-muted-foreground/60 text-xs"
                      >{shortId(c)}</span
                    >
                  {/if}
                </Button>
              {/if}
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuLabel>{displayName(c)}</ContextMenuLabel>
              <ContextMenuSeparator />
              <ContextMenuItem
                onselect={() => operate("start", c)}
                disabled={c.State === "running"}
              >
                <Play size={13} />
                {m.docker_start()}
              </ContextMenuItem>
              <ContextMenuItem
                onselect={() => operate("stop", c)}
                disabled={c.State !== "running"}
              >
                <Square size={13} />
                {m.docker_stop()}
              </ContextMenuItem>
              <ContextMenuItem onselect={() => operate("restart", c)}>
                <RotateCw size={13} />
                {m.docker_restart()}
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        {/each}
        {#if filtered.length === 0}
          <span class="w-full text-center text-muted-foreground text-xs py-4"
            >{m.docker_no_containers()}</span
          >
        {/if}
      </div>
    </ScrollArea>
  {/if}
</div>
