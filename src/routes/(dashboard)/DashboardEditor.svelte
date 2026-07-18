<script lang="ts">
  import { Pencil, Save, Plus, Settings } from "@lucide/svelte";
  import { m } from "$lib/paraglide/messages.js";
  import { toast } from "svelte-sonner";
  import { browser } from "$app/environment";
  import { Button } from "$lib/components/ui/button/index.js";
  import { saveDashboardConfig } from "$lib/remotes/settings.remote.js";
  import WidgetPalette from "$lib/components/dashboard/WidgetPalette.svelte";
  import WidgetPropertyPanel from "$lib/components/dashboard/WidgetPropertyPanel.svelte";
  import DashboardWidgetFrame from "$lib/components/dashboard/DashboardWidgetFrame.svelte";
  import WidgetRenderer from "$lib/components/dashboard/WidgetRenderer.svelte";
  import {
    widgetStyle,
    makeId,
    cellFromEvent,
    canPlace,
    findNearestFreePosition,
    overlaps,
    getWidgetBounds,
    mobileCanvasMetrics,
  } from "$lib/dashboard/grid-utils.js";
  import { resizePatchForDirection } from "$lib/dashboard/resize-utils.js";
  import type { ResizeDirection } from "$lib/dashboard/resize-utils.js";
  import PasskeyModal from "$lib/components/dashboard/PasskeyModal.svelte";
  import DashboardPageCards from "$lib/components/dashboard/DashboardPageCards.svelte";

  let {
    initialConfig,
    systemConfig,
    isAuthenticated = false,
    passkeyCount = 0,
  }: {
    initialConfig: any;
    systemConfig?: any;
    isAuthenticated?: boolean;
    passkeyCount?: number;
  } = $props();

  const startingConfig = structuredClone(initialConfig);
  let config: any = $state(startingConfig);
  let drawerOpen = $state(false);
  let saving = $state(false);
  let canvasElement = $state<HTMLElement | null>(null);
  let draftWidget: string | null = $state(null);
  let gridActive = $state(false);
  let editMode = $state(false);
  let passkeyVerified = $state(false);
  let showPasskeyModal = $state(false);
  let dirty = $state(false);
  let selected: { id: string; childId?: string } | null = $state(null);
  let draggingTemplateType: string | null = $state(null);
  let draggingWidgetId: string | null = $state(null);
  let didCenterMobileCanvas = false;

  // ── Multi-page state ──
  let pages: any[] = $state(config.dashboard.pages ?? []);

  function getStoredPageId(): string {
    if (!browser) return pages[0]?.id ?? "";
    const stored = localStorage.getItem("dashboard_active_page");
    if (stored && pages.some((p: any) => p.id === stored)) return stored;
    return pages[0]?.id ?? "";
  }

  let activePageId = $state(getStoredPageId());

  $effect(() => {
    if (browser && activePageId) {
      localStorage.setItem("dashboard_active_page", activePageId);
    }
  });

  let widgets: any[] = $state([]);

  $effect(() => {
    const page = pages.find((p: any) => p.id === activePageId);
    widgets = page?.widgets ?? [];
  });

  function handlePageSelect(id: string) {
    // Sync current widgets back to current page before switching
    pages = pages.map((p: any) =>
      p.id === activePageId ? { ...p, widgets: [...widgets] } : p,
    );
    activePageId = id;
  }

  let grid = $derived(config.dashboard.grid);
  let selectedWidget = $derived(getSelectedWidget());
  let authenticatedForEdit = $derived(isAuthenticated || passkeyVerified);

  let viewWidth = $state(browser ? window.innerWidth : 1920);
  let viewHeight = $state(browser ? window.innerHeight : 1080);

  $effect(() => {
    if (!browser) return;
    function handler() {
      viewWidth = window.innerWidth;
      viewHeight = window.innerHeight;
    }
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  });

  let baseCellWidth = $derived(
    grid.cellWidth || Math.max(viewWidth / (grid.columns || 12), 1),
  );
  let baseCellHeight = $derived(
    grid.cellHeight || Math.max(viewHeight / (grid.rows || 8), 1),
  );
  let isMobileCanvas = $derived(viewWidth < 768);
  let mobileScale = $derived(
    Math.min(1, Math.max(0.4, Number(grid.mobileScale ?? 0.75))),
  );
  let cellSize = $derived(baseCellWidth * (isMobileCanvas ? mobileScale : 1));
  let cellHeight = $derived(
    baseCellHeight * (isMobileCanvas ? mobileScale : 1),
  );
  let widgetBounds = $derived(getWidgetBounds(widgets));
  let mobileMetrics = $derived(
    mobileCanvasMetrics({
      bounds: widgetBounds,
      cellWidth: cellSize,
      cellHeight,
      viewWidth,
      viewHeight,
      paddingCells: 2,
    }),
  );
  let pageCenter = $derived(
    isMobileCanvas ? mobileMetrics.pageCenter : viewWidth / 2,
  );

  let gridRows = $derived(
    (() => {
      return Math.max(8, ...widgets.map((w: any) => w.y + w.h - 1));
    })(),
  );
  let gridVisualHeight = $derived(
    isMobileCanvas
      ? mobileMetrics.height
      : Math.max(gridRows * cellHeight, viewHeight),
  );
  let gridVisualWidth = $derived(
    isMobileCanvas ? mobileMetrics.width : viewWidth,
  );

  $effect(() => {
    if (!browser || !isMobileCanvas || didCenterMobileCanvas) return;
    requestAnimationFrame(() => {
      window.scrollTo({
        left: Math.max(0, pageCenter - viewWidth / 2),
        top: window.scrollY,
      });
      didCenterMobileCanvas = true;
    });
  });

  // widgetStyle and makeId moved to $lib/dashboard/grid-utils.js

  function dragTemplate(event: DragEvent, template: any) {
    if (!editMode) return;
    if (!event.dataTransfer) return;
    gridActive = true;
    draggingTemplateType = template.type;
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(
      "application/x-magma-template",
      JSON.stringify(template),
    );
  }

  function dragWidget(event: DragEvent, widget: any) {
    if (!editMode || widget.type !== "button") return;
    if (!event.dataTransfer) return;
    gridActive = true;
    draggingWidgetId = widget.id;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-magma-widget-id", widget.id);
  }

  // cellFromEvent moved to $lib/dashboard/grid-utils.js

  function onDrop(event: DragEvent) {
    event.preventDefault();
    if (!editMode) return;
    if (!event.dataTransfer || !canvasElement) return;
    const raw = event.dataTransfer.getData("application/x-magma-template");
    if (!raw) {
      gridActive = false;
      return;
    }

    const template = JSON.parse(raw);
    if (template.type === "button") {
      gridActive = false;
      toast.error(m.editor_only_in_stack());
      return;
    }

    const cell = cellFromEvent(
      event,
      canvasElement,
      pageCenter,
      cellSize,
      cellHeight,
    );
    const templateW = template.w;
    const templateH = template.h;

    const bestPos = findNearestFreePosition(
      cell,
      { w: templateW, h: templateH },
      widgets,
      20,
    );

    if (bestPos) {
      const widget: any = {
        id: makeId(template.type),
        type: template.type,
        title: template.title,
        x: bestPos.x,
        y: bestPos.y,
        w: templateW,
        h: templateH,
        config: structuredClone(template.config || {}),
      };
      if (template.children)
        widget.children = structuredClone(template.children);
      widgets = [...widgets, widget];
      dirty = true;
      gridActive = false;
      toast.info(m.editor_widget_added());
    } else {
      gridActive = false;
      toast.error(m.editor_grid_full());
    }
  }

  function onDragOver(event: DragEvent) {
    if (!editMode) return;
    if (!event.dataTransfer) return;
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

  function dropIntoStack(event: DragEvent, stack: any) {
    event.preventDefault();
    event.stopPropagation();
    gridActive = false;
    if (!event.dataTransfer) return;
    if (
      !editMode ||
      !["stack", "stack-horizontal", "stack-vertical"].includes(stack.type)
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
        toast.error(m.editor_only_in_stack());
        return;
      }

      const child = {
        id: makeId(template.type),
        type: template.type,
        title: template.title,
        config: structuredClone(template.config || {}),
      };
      addChildToStack(stack.id, child);
      toast.info(m.editor_button_added_stack());
      return;
    }

    if (widgetId) {
      const widget = widgets.find((item: any) => item.id === widgetId);
      if (!widget || widget.type !== "button" || widget.id === stack.id) return;
      const child = {
        id: widget.id,
        type: widget.type,
        title: widget.title,
        config: structuredClone(widget.config || {}),
      };
      widgets = widgets
        .filter((item: any) => item.id !== widget.id)
        .map((item: any) =>
          item.id === stack.id
            ? { ...item, children: [...(item.children || []), child] }
            : item,
        );
      selected = { id: stack.id, childId: child.id };
      dirty = true;
      toast.info(m.editor_button_moved_stack());
    }
  }

  function dragOverStack(event: DragEvent) {
    if (!editMode) return;
    if (!event.dataTransfer) return;
    const acceptsDrop =
      draggingTemplateType === "button" || Boolean(draggingWidgetId);

    if (!acceptsDrop) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = draggingWidgetId ? "move" : "copy";
  }

  function startMove(event: PointerEvent, widget: any) {
    if (!editMode) return;
    if (!canvasElement) return;
    const canvas = canvasElement;
    event.preventDefault();
    const start = cellFromEvent(
      event,
      canvas,
      pageCenter,
      cellSize,
      cellHeight,
    );
    const original = { x: widget.x, y: widget.y };
    draftWidget = widget.id;
    gridActive = true;

    function move(moveEvent: PointerEvent) {
      const cell = cellFromEvent(
        moveEvent,
        canvas,
        pageCenter,
        cellSize,
        cellHeight,
      );
      updateWidget(widget.id, {
        x: original.x + cell.x - start.x,
        y: Math.max(1, original.y + cell.y - start.y),
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

  function startResize(
    event: PointerEvent,
    widget: any,
    direction: ResizeDirection,
  ) {
    if (!editMode) return;
    if (!canvasElement) return;
    const canvas = canvasElement;
    event.preventDefault();
    event.stopPropagation();
    const start = cellFromEvent(
      event,
      canvas,
      pageCenter,
      cellSize,
      cellHeight,
    );
    const original = { x: widget.x, y: widget.y, w: widget.w, h: widget.h };
    draftWidget = widget.id;
    gridActive = true;

    function move(moveEvent: PointerEvent) {
      const cell = cellFromEvent(
        moveEvent,
        canvas,
        pageCenter,
        cellSize,
        cellHeight,
      );
      updateWidget(
        widget.id,
        resizePatchForDirection(
          original,
          { dx: cell.x - start.x, dy: cell.y - start.y },
          direction,
        ),
      );
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

  function updateWidget(id: string, patch: Record<string, any>) {
    widgets = widgets.map((widget: any) => {
      if (widget.id !== id) return widget;
      const next = { ...widget, ...patch };
      return canPlace(next, widgets, id) ? next : widget;
    });
  }

  function reorderChildInStack(
    stackId: string,
    childId: string,
    targetIndex: number,
  ) {
    widgets = widgets.map((widget: any) => {
      if (widget.id !== stackId) return widget;
      const children = widget.children || [];
      const fromIndex = children.findIndex((c: any) => c.id === childId);
      if (fromIndex === -1 || fromIndex === targetIndex) return widget;
      const newChildren = [...children];
      const [moved] = newChildren.splice(fromIndex, 1);
      const adjustedTarget =
        targetIndex > fromIndex ? targetIndex - 1 : targetIndex;
      newChildren.splice(adjustedTarget, 0, moved);
      return { ...widget, children: newChildren };
    });
    dirty = true;
  }

  function addChildToStack(stackId: string, child: any) {
    widgets = widgets.map((widget: any) =>
      widget.id === stackId
        ? { ...widget, children: [...(widget.children || []), child] }
        : widget,
    );
    selected = { id: stackId, childId: child.id };
    dirty = true;
  }

  function deleteWidget(widget: any, childId?: string) {
    if (!editMode) return;

    if (childId) {
      widgets = widgets.map((item: any) =>
        item.id === widget.id
          ? {
              ...item,
              children: (item.children || []).filter(
                (child: any) => child.id !== childId,
              ),
            }
          : item,
      );
      selected = null;
      dirty = true;
      toast.info(m.editor_widget_deleted());
      return;
    }

    widgets = widgets.filter((item: any) => item.id !== widget.id);
    if (selected?.id === widget.id) selected = null;
    dirty = true;
    toast.info(m.editor_widget_deleted());
  }

  function getSelectedWidget() {
    if (!selected) return null;
    const currentSelection = selected;
    const parent = widgets.find(
      (widget: any) => widget.id === currentSelection.id,
    );
    if (!parent) return null;
    if (!currentSelection.childId) return parent;
    return (
      parent.children?.find(
        (child: any) => child.id === currentSelection.childId,
      ) || null
    );
  }

  function selectWidget(event: Event, widget: any, childId?: string) {
    if (!editMode) return;
    event.preventDefault();
    event.stopPropagation();
    selected = childId ? { id: widget.id, childId } : { id: widget.id };
    drawerOpen = false;
  }

  function updateSelected(patch: Record<string, any>) {
    if (!selected) return;
    const currentSelection = selected;

    if (currentSelection.childId) {
      widgets = widgets.map((widget: any) => {
        if (widget.id !== currentSelection.id) return widget;
        return {
          ...widget,
          children: (widget.children || []).map((child: any) =>
            child.id === currentSelection.childId
              ? { ...child, ...patch }
              : child,
          ),
        };
      });
      dirty = true;
      return;
    }

    const current = widgets.find(
      (widget: any) => widget.id === currentSelection.id,
    );
    if (!current) return;
    const next = { ...current, ...patch };
    if (!canPlace(next, widgets, currentSelection.id)) {
      toast.error(m.editor_properties_dont_fit());
      return;
    }

    widgets = widgets.map((widget: any) =>
      widget.id === currentSelection.id ? next : widget,
    );
    dirty = true;
  }

  function updateSelectedConfig(key: string, value: string | boolean | number) {
    if (!selectedWidget) return;
    updateSelected({
      config: {
        ...(selectedWidget.config || {}),
        [key]: value,
      },
    });
  }

  function updateSelectedNumber(key: string, value: string) {
    const number = Number(value);
    if (!Number.isFinite(number)) return;
    updateSelected({ [key]: Math.round(number) });
  }

  // canPlace, overlaps, clamp moved to $lib/dashboard/grid-utils.js

  async function save() {
    saving = true;
    try {
      pages = pages.map((p: any) =>
        p.id === activePageId ? { ...p, widgets: [...widgets] } : p,
      );
      config.dashboard.pages = pages;
      const data = await saveDashboardConfig({ config });
      config = data.config;
      dirty = false;
      toast.success(m.editor_dashboard_saved());
      return true;
    } catch (saveError) {
      toast.error(
        saveError instanceof Error ? saveError.message : String(saveError),
      );
      return false;
    } finally {
      saving = false;
    }
  }

  async function toggleEditMode() {
    if (!editMode) {
      if (passkeyCount > 0 && !authenticatedForEdit) {
        showPasskeyModal = true;
        return;
      }
      editMode = true;
      toast.info(m.editor_edit_mode());
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

  function onPasskeySuccess() {
    showPasskeyModal = false;
    passkeyVerified = true;
    editMode = true;
    toast.info(m.editor_edit_mode());
  }
</script>

<section class="max-sm:p-4 max-sm:overflow-x-auto flex flex-col min-h-0">
  <nav
    class="fixed right-6 bottom-6 z-22 flex items-center justify-end gap-2.5 max-sm:right-3 max-sm:bottom-3 max-sm:left-3 max-sm:flex-wrap"
    aria-label={m.editor_actions_aria_label()}
  >
    <Button
      href="/settings"
      variant="magma"
      class="aspect-square"
      title={m.editor_settings()}
      aria-label={m.editor_settings()}><Settings size={20} /></Button
    >
    {#if editMode}
      <Button variant="magma" onclick={() => (drawerOpen = true)}>
        <Plus size={18} />
        {m.editor_add_widget()}
      </Button>
    {/if}
    <Button
      variant="magma"
      class="aspect-square"
      aria-pressed={editMode}
      onclick={toggleEditMode}
    >
      {#if editMode}
        <Save size={18} /> {m.editor_save()}
      {:else}
        <Pencil size={18} />
      {/if}
    </Button>
  </nav>

  {#if pages.length > 1}
    <DashboardPageCards
      {pages}
      {activePageId}
      onSelect={handlePageSelect}
      position={systemConfig?.system?.navPosition ?? "left"}
    />
  {/if}

  <div
    bind:this={canvasElement}
    class:edit-mode={editMode}
    class:grid-active={editMode}
    class={`dashboard-grid relative z-1 border-0 rounded-none bg-transparent overflow-visible ${isMobileCanvas ? "ml-0" : "w-screen -ml-6"}`}
    role="application"
    aria-label={m.editor_settings()}
    ondrop={onDrop}
    ondragover={onDragOver}
    style={`--columns: ${grid.columns}; --cell-size-x: ${cellSize}px; --cell-size-y: ${cellHeight}px; width: ${gridVisualWidth}px; min-height: ${gridVisualHeight}px; background-position: ${pageCenter % cellSize}px 0;`}
  >
    {#if browser}
      {#each widgets as widget (widget.id)}
        <DashboardWidgetFrame
          {widget}
          {editMode}
          dragging={draftWidget === widget.id}
          selected={selected?.id === widget.id && !selected?.childId}
          style={widgetStyle(widget, pageCenter, cellSize, cellHeight)}
          noTitle={widget.type === "button"}
          onSelect={selectWidget}
          onDragWidget={dragWidget}
          onDragEnd={endTemplateDrag}
          onStartMove={startMove}
          onDelete={(event, target) => {
            event.preventDefault();
            event.stopPropagation();
            deleteWidget(target);
          }}
          onStartResize={startResize}
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
            onReorderChild={reorderChildInStack}
          />
        </DashboardWidgetFrame>
      {/each}
    {/if}
  </div>

  {#if editMode && drawerOpen}
    <WidgetPalette
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

  <PasskeyModal
    open={showPasskeyModal}
    onSuccess={onPasskeySuccess}
    onClose={() => (showPasskeyModal = false)}
  />
</section>
