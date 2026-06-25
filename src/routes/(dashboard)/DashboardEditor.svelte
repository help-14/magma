<script>
  // @ts-nocheck
  import {
    GripHorizontal,
    Maximize2,
    Pencil,
    Plus,
    Settings,
    Trash2,
  } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { browser } from "$app/environment";
  import { Button } from "$lib/components/ui/button/index.js";
  import { saveDashboardConfig } from "$lib/remotes/settings.remote.js";
  import WidgetPalette from "$lib/components/dashboard/WidgetPalette.svelte";
  import WidgetPropertyPanel from "$lib/components/dashboard/WidgetPropertyPanel.svelte";
  import WidgetRenderer from "$lib/components/dashboard/WidgetRenderer.svelte";

  let { initialConfig } = $props();

  const startingConfig = structuredClone(initialConfig);
  let config = $state(startingConfig);
  let drawerOpen = $state(false);
  let saving = $state(false);
  let canvasElement = $state();
  let draftWidget = $state(null);
  let gridActive = $state(false);
  let editMode = $state(false);
  let dirty = $state(false);
  let selected = $state(null);
  let draggingTemplateType = $state(null);
  let draggingWidgetId = $state(null);

  let viewSize = $state({
    width: browser ? window.innerWidth : 0,
    height: browser ? window.innerHeight : 0,
  });

  $effect(() => {
    if (!browser) return;
    function handler() {
      viewSize = { width: window.innerWidth, height: window.innerHeight };
    }
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  });

  const templates = [
    {
      type: "button",
      title: "Button",
      w: 2,
      h: 1,
      config: { icon: "server", url: "https://" },
    },
    {
      type: "search",
      title: "Search",
      w: 4,
      h: 1,
      config: { provider: "google" },
    },
    { type: "timer", title: "Timer", w: 5, h: 2, config: {} },
    {
      type: "weather",
      title: "Weather",
      w: 2,
      h: 2,
      config: { locationRef: "default" },
    },
    { type: "calendar", title: "Calendar", w: 2, h: 2, config: {} },
    {
      type: "stack-horizontal",
      title: "Horizontal Stack",
      w: 5,
      h: 2,
      config: { gap: 12 },
      children: [],
    },
    {
      type: "stack-vertical",
      title: "Vertical Stack",
      w: 3,
      h: 4,
      config: { gap: 12 },
      children: [],
    },
    { type: "docker-status", title: "Docker", w: 3, h: 2, config: {} },
  ];

  let grid = $derived(config.dashboard.grid);
  let widgets = $derived(config.dashboard.widgets);
  let selectedWidget = $derived(getSelectedWidget());

  let cellSize = $derived(Math.max(viewSize.width / grid.columns, 1));
  let cellHeight = $derived(Math.max(viewSize.height / grid.rows, 1));

  let gridRows = $derived(
    (() => {
      const widgetMax = Math.max(0, ...widgets.map((w) => w.y + w.h - 1));
      const buffer = gridActive ? 6 : 0;
      return Math.max(grid.rows ?? 6, widgetMax) + buffer;
    })(),
  );

  function widgetStyle(widget) {
    return [
      `left: ${(widget.x - 1) * cellSize}px`,
      `top: ${(widget.y - 1) * cellHeight}px`,
      `width: ${widget.w * cellSize}px`,
      `height: ${widget.h * cellHeight}px`,
    ].join(";");
  }

  function makeId(type) {
    return `${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  }

  function dragTemplate(event, template) {
    if (!editMode) return;
    gridActive = true;
    draggingTemplateType = template.type;
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(
      "application/x-magma-template",
      JSON.stringify(template),
    );
  }

  function dragWidget(event, widget) {
    if (!editMode || widget.type !== "button") return;
    gridActive = true;
    draggingWidgetId = widget.id;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-magma-widget-id", widget.id);
  }

  function cellFromEvent(event) {
    const rect = canvasElement.getBoundingClientRect();
    return {
      x: Math.min(
        grid.columns,
        Math.max(1, Math.floor((event.clientX - rect.left) / cellSize) + 1),
      ),
      y: Math.min(
        gridRows,
        Math.max(1, Math.floor((event.clientY - rect.top) / cellHeight) + 1),
      ),
    };
  }

  function onDrop(event) {
    event.preventDefault();
    gridActive = false;
    if (!editMode) return;
    const raw = event.dataTransfer.getData("application/x-magma-template");
    if (!raw) return;

    const template = JSON.parse(raw);
    if (template.type === "button") {
      toast.error("Button widgets can only be dropped into a stack.");
      return;
    }
    const cell = cellFromEvent(event);
    const widget = {
      id: makeId(template.type),
      type: template.type,
      title: template.title,
      x: Math.min(cell.x, grid.columns - template.w + 1),
      y: Math.min(cell.y, gridRows - template.h + 1),
      w: template.w,
      h: template.h,
      config: structuredClone(template.config || {}),
    };
    if (template.children) widget.children = structuredClone(template.children);

    if (canPlace(widget)) {
      config.dashboard.widgets = [...widgets, widget];
      dirty = true;
      toast.info("Widget added. Press Done to save.");
    } else {
      toast.error("That widget does not fit there.");
    }
  }

  function onDragOver(event) {
    if (!editMode) return;
    if (draggingTemplateType === "button" || draggingWidgetId) {
      event.dataTransfer.dropEffect = "none";
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function endTemplateDrag() {
    gridActive = false;
    draggingTemplateType = null;
    draggingWidgetId = null;
  }

  function dropIntoStack(event, stack) {
    event.preventDefault();
    event.stopPropagation();
    gridActive = false;
    if (
      !editMode ||
      !["stack-horizontal", "stack-vertical"].includes(stack.type)
    )
      return;

    const templateRaw = event.dataTransfer.getData(
      "application/x-magma-template",
    );
    const widgetId = event.dataTransfer.getData(
      "application/x-magma-widget-id",
    );

    if (templateRaw) {
      const template = JSON.parse(templateRaw);
      if (template.type !== "button") {
        toast.error("Only button widgets can be dropped into a stack.");
        return;
      }

      const child = {
        id: makeId(template.type),
        type: template.type,
        title: template.title,
        config: structuredClone(template.config || {}),
      };
      addChildToStack(stack.id, child);
      toast.info("Button added to stack. Press Done to save.");
      return;
    }

    if (widgetId) {
      const widget = widgets.find((item) => item.id === widgetId);
      if (!widget || widget.type !== "button" || widget.id === stack.id) return;
      const child = {
        id: widget.id,
        type: widget.type,
        title: widget.title,
        config: structuredClone(widget.config || {}),
      };
      config.dashboard.widgets = widgets
        .filter((item) => item.id !== widget.id)
        .map((item) =>
          item.id === stack.id
            ? { ...item, children: [...(item.children || []), child] }
            : item,
        );
      selected = { id: stack.id, childId: child.id };
      dirty = true;
      toast.info("Button moved into stack. Press Done to save.");
    }
  }

  function dragOverStack(event) {
    if (!editMode) return;
    const acceptsDrop =
      draggingTemplateType === "button" || Boolean(draggingWidgetId);

    if (!acceptsDrop) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = draggingWidgetId ? "move" : "copy";
  }

  function startMove(event, widget) {
    if (!editMode) return;
    event.preventDefault();
    const start = cellFromEvent(event);
    const original = { x: widget.x, y: widget.y };
    draftWidget = widget.id;
    gridActive = true;

    function move(moveEvent) {
      const cell = cellFromEvent(moveEvent);
      updateWidget(widget.id, {
        x: clamp(original.x + cell.x - start.x, 1, grid.columns - widget.w + 1),
        y: clamp(original.y + cell.y - start.y, 1, gridRows - widget.h + 1),
      });
    }

    function stop() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      draftWidget = null;
      gridActive = false;
      dirty = true;
    }

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  }

  function startResize(event, widget) {
    if (!editMode) return;
    event.preventDefault();
    const start = cellFromEvent(event);
    const original = { w: widget.w, h: widget.h };
    draftWidget = widget.id;
    gridActive = true;

    function move(moveEvent) {
      const cell = cellFromEvent(moveEvent);
      updateWidget(widget.id, {
        w: clamp(original.w + cell.x - start.x, 1, grid.columns - widget.x + 1),
        h: clamp(original.h + cell.y - start.y, 1, gridRows - widget.y + 1),
      });
    }

    function stop() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      draftWidget = null;
      gridActive = false;
      dirty = true;
    }

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  }

  function updateWidget(id, patch) {
    config.dashboard.widgets = widgets.map((widget) => {
      if (widget.id !== id) return widget;
      const next = { ...widget, ...patch };
      return canPlace(next, id) ? next : widget;
    });
  }

  function addChildToStack(stackId, child) {
    config.dashboard.widgets = widgets.map((widget) =>
      widget.id === stackId
        ? { ...widget, children: [...(widget.children || []), child] }
        : widget,
    );
    selected = { id: stackId, childId: child.id };
    dirty = true;
  }

  function deleteWidget(widget, childId = null) {
    if (!editMode) return;

    if (childId) {
      config.dashboard.widgets = widgets.map((item) =>
        item.id === widget.id
          ? {
              ...item,
              children: (item.children || []).filter(
                (child) => child.id !== childId,
              ),
            }
          : item,
      );
      selected = null;
      dirty = true;
      toast.info("Widget deleted. Press Done to save.");
      return;
    }

    config.dashboard.widgets = widgets.filter((item) => item.id !== widget.id);
    if (selected?.id === widget.id) selected = null;
    dirty = true;
    toast.info("Widget deleted. Press Done to save.");
  }

  function getSelectedWidget() {
    if (!selected) return null;
    const parent = widgets.find((widget) => widget.id === selected.id);
    if (!parent) return null;
    if (!selected.childId) return parent;
    return (
      parent.children?.find((child) => child.id === selected.childId) || null
    );
  }

  function selectWidget(event, widget, childId = null) {
    if (!editMode) return;
    event.preventDefault();
    event.stopPropagation();
    selected = { id: widget.id, childId };
    drawerOpen = false;
  }

  function updateSelected(patch) {
    if (!selected) return;

    if (selected.childId) {
      config.dashboard.widgets = widgets.map((widget) => {
        if (widget.id !== selected.id) return widget;
        return {
          ...widget,
          children: (widget.children || []).map((child) =>
            child.id === selected.childId ? { ...child, ...patch } : child,
          ),
        };
      });
      dirty = true;
      return;
    }

    const current = widgets.find((widget) => widget.id === selected.id);
    if (!current) return;
    const next = { ...current, ...patch };
    if (!canPlace(next, selected.id)) {
      toast.error("Those properties do not fit the grid.");
      return;
    }

    config.dashboard.widgets = widgets.map((widget) =>
      widget.id === selected.id ? next : widget,
    );
    dirty = true;
  }

  function updateSelectedConfig(key, value) {
    if (!selectedWidget) return;
    updateSelected({
      config: {
        ...(selectedWidget.config || {}),
        [key]: value,
      },
    });
  }

  function updateSelectedNumber(key, value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return;
    updateSelected({ [key]: Math.round(number) });
  }

  function canPlace(candidate, ignoreId = candidate.id) {
    if (
      candidate.x < 1 ||
      candidate.y < 1 ||
      candidate.w < 1 ||
      candidate.h < 1
    )
      return false;
    if (candidate.x + candidate.w - 1 > grid.columns) return false;
    if (candidate.y + candidate.h - 1 > gridRows) return false;

    return widgets.every(
      (widget) => widget.id === ignoreId || !overlaps(candidate, widget),
    );
  }

  function overlaps(a, b) {
    return (
      a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
    );
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  async function save() {
    saving = true;
    try {
      const data = await saveDashboardConfig({ config });
      config = data.config;
      dirty = false;
      toast.success("Dashboard saved");
      return true;
    } catch (saveError) {
      toast.error(saveError.message);
      return false;
    } finally {
      saving = false;
    }
  }

  async function toggleEditMode() {
    if (!editMode) {
      editMode = true;
      toast.info("Edit mode enabled");
      return;
    }

    if (dirty) {
      const saved = await save();
      if (!saved) return;
    }

    editMode = false;
    drawerOpen = false;
    gridActive = false;
    draftWidget = null;
    draggingTemplateType = null;
    draggingWidgetId = null;
    selected = null;
  }
</script>

<section
  class="relative min-h-screen p-6 text-magma-text max-sm:p-4.5"
  style={`--magma-accent: ${config.theme?.accentColor || "#fabd2f"}; --magma-bg: url('${config.theme?.backgroundImage || "/bg.jpg"}');`}
>
  <div class="background"></div>

  <nav
    class="fixed right-6 bottom-6 z-22 flex items-center justify-end gap-2.5 max-sm:right-3 max-sm:bottom-3 max-sm:left-3 max-sm:flex-wrap"
    aria-label="Dashboard actions"
  >
    <Button
      href="/settings"
      variant="magma"
      class="aspect-square"
      title="Settings"
      aria-label="Settings"><Settings size={20} /></Button
    >
    <Button variant="magma" aria-pressed={editMode} onclick={toggleEditMode}>
      <Pencil size={18} />
      {editMode ? (saving ? "Saving..." : "Done") : "Edit"}
    </Button>
    {#if editMode}
      <Button variant="magma" onclick={() => (drawerOpen = true)}
        ><Plus size={18} /> Add Widget</Button
      >
    {/if}
  </nav>

  <div
    bind:this={canvasElement}
    class:edit-mode={editMode}
    class:grid-active={editMode}
    class="dashboard-grid relative z-1 w-screen -ml-6 border-0 rounded-none bg-transparent overflow-visible"
    role="application"
    aria-label="Dashboard widget grid"
    ondrop={onDrop}
    ondragover={onDragOver}
    style={`--columns: ${grid.columns}; --cell-size-x: ${cellSize}px; --cell-size-y: ${cellHeight}px; height: ${gridRows * cellHeight}px;`}
  >
    {#if browser}
      {#each widgets as widget (widget.id)}
        <article
          class:dragging={draftWidget === widget.id}
          class:selected={selected?.id === widget.id && !selected?.childId}
          class="absolute p-1.5 animate-in fade-in duration-200"
          draggable={editMode && widget.type === "button"}
          style={widgetStyle(widget)}
          onclick={(event) => selectWidget(event, widget)}
          ondragstart={(event) => dragWidget(event, widget)}
          ondragend={endTemplateDrag}
        >
        {#if editMode}
          <Button
            class={`absolute top-1.5 left-1.5 right-1.5 z-3 flex items-center justify-center gap-1.5 h-7 border-0 rounded-t-lg bg-magma-accent/88 text-[#211b12] text-xs font-extrabold cursor-grab transition-opacity duration-100 focus-visible:opacity-100 active:cursor-grabbing ${editMode ? "opacity-100" : "opacity-0"}`}
            type="button"
            draggable={widget.type === "button"}
            ondragstart={(event) => dragWidget(event, widget)}
            ondragend={endTemplateDrag}
            onpointerdown={(event) => startMove(event, widget)}
          >
            <GripHorizontal size={16} />
            <span>{widget.title}</span>
          </Button>
          <Button
            class={`absolute top-3 right-3 z-5 grid size-7 place-items-center border border-white/18 rounded-lg bg-[rgb(80_24_18/88%)] text-[#ffe1d8] cursor-pointer transition-all duration-100 hover:bg-[rgb(130_36_28/94%)] active:scale-96 focus-visible:opacity-100 ${editMode ? "opacity-100" : "opacity-0"}`}
            type="button"
            aria-label={`Delete ${widget.title}`}
            title="Delete widget"
            onclick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              deleteWidget(widget);
            }}
          >
            <Trash2 size={14} />
          </Button>
        {/if}
        <div
          class={`flex w-full h-full min-w-0 min-h-0 overflow-hidden border border-magma-line rounded-lg backdrop-blur-md ${editMode ? "bg-magma-panel-strong shadow-[0_0_0_1px_rgb(250_189_47/24%),0_18px_46px_rgb(0_0_0/26%)]" : "bg-magma-panel shadow-[0_12px_34px_rgb(0_0_0/16%)]"}`}
        >
          <WidgetRenderer
            {widget}
            locations={config.locations || {}}
            {editMode}
            selectedChildId={selected?.id === widget.id
              ? selected?.childId
              : null}
            onSelectChild={(event, child) =>
              selectWidget(event, widget, child.id)}
            onDeleteChild={(event, child) => deleteWidget(widget, child.id)}
            onDropChild={(event) => dropIntoStack(event, widget)}
            onDragOverChild={dragOverStack}
          />
        </div>
        {#if editMode}
          <Button
            class={`absolute right-3 bottom-3 z-4 grid size-7 place-items-center border border-magma-line rounded-lg bg-[rgb(20_18_16/82%)] text-magma-text cursor-nwse-resize transition-opacity duration-100 focus-visible:opacity-100 ${editMode ? "opacity-100" : "opacity-0"}`}
            type="button"
            onpointerdown={(event) => startResize(event, widget)}
          >
            <Maximize2 size={14} />
          </Button>
        {/if}
        </article>
      {/each}
    {/if}
  </div>

  {#if editMode && drawerOpen}
    <WidgetPalette
      {templates}
      onClose={() => (drawerOpen = false)}
      onDragStart={dragTemplate}
      onDragEnd={endTemplateDrag}
    />
  {/if}

  {#if editMode && selectedWidget}
    <WidgetPropertyPanel
      {grid}
      {gridRows}
      {selected}
      widget={selectedWidget}
      onClose={() => (selected = null)}
      onUpdate={updateSelected}
      onUpdateConfig={updateSelectedConfig}
      onUpdateNumber={updateSelectedNumber}
    />
  {/if}
</section>
