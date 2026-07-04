<script>
  // @ts-nocheck
  import {
    GripHorizontal,
    ArrowDownRight,
    Pencil,
    Save,
    Plus,
    Settings,
    Trash2
  } from '@lucide/svelte'
  import { m } from '$lib/paraglide/messages.js'
  import { toast } from 'svelte-sonner'
  import { browser } from '$app/environment'
  import { Button } from '$lib/components/ui/button/index.js'
  import { saveDashboardConfig } from '$lib/remotes/settings.remote.js'
  import WidgetPalette from '$lib/components/dashboard/WidgetPalette.svelte'
  import WidgetPropertyPanel from '$lib/components/dashboard/WidgetPropertyPanel.svelte'
  import WidgetRenderer from '$lib/components/dashboard/WidgetRenderer.svelte'
  import {
    widgetStyle,
    makeId,
    cellFromEvent,
    canPlace,
    findNearestFreePosition,
    overlaps
  } from '$lib/dashboard/grid-utils.js'

  let { initialConfig } = $props()

  const startingConfig = structuredClone(initialConfig)
  let config = $state(startingConfig)
  let drawerOpen = $state(false)
  let saving = $state(false)
  let canvasElement = $state()
  let draftWidget = $state(null)
  let gridActive = $state(false)
  let editMode = $state(false)
  let dirty = $state(false)
  let selected = $state(null)
  let draggingTemplateType = $state(null)
  let draggingWidgetId = $state(null)

  let grid = $derived(config.dashboard.grid)
  let widgets = $derived(config.dashboard.widgets)
  let selectedWidget = $derived(getSelectedWidget())

  let viewWidth = $state(browser ? window.innerWidth : 1920)
  let viewHeight = $state(browser ? window.innerHeight : 1080)

  $effect(() => {
    if (!browser) return
    function handler() {
      viewWidth = window.innerWidth
      viewHeight = window.innerHeight
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  })

  let cellSize = $derived(
    grid.cellWidth || Math.max(viewWidth / (grid.columns || 12), 1)
  )
  let cellHeight = $derived(
    grid.cellHeight || Math.max(viewHeight / (grid.rows || 8), 1)
  )
  let pageCenter = $derived(viewWidth / 2)
  let gridVisualHeight = $derived(Math.max(gridRows * cellHeight, viewHeight))

  let gridRows = $derived(
    (() => {
      return Math.max(8, ...widgets.map((w) => w.y + w.h - 1))
    })()
  )

  // widgetStyle and makeId moved to $lib/dashboard/grid-utils.js

  function dragTemplate(event, template) {
    if (!editMode) return
    gridActive = true
    draggingTemplateType = template.type
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData(
      'application/x-magma-template',
      JSON.stringify(template)
    )
  }

  function dragWidget(event, widget) {
    if (!editMode || widget.type !== 'button') return
    gridActive = true
    draggingWidgetId = widget.id
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/x-magma-widget-id', widget.id)
  }

  // cellFromEvent moved to $lib/dashboard/grid-utils.js

  function onDrop(event) {
    event.preventDefault()
    if (!editMode) return
    const raw = event.dataTransfer.getData('application/x-magma-template')
    if (!raw) {
      gridActive = false
      return
    }

    const template = JSON.parse(raw)
    if (template.type === 'button') {
      gridActive = false
      toast.error(m.editor_only_in_stack())
      return
    }

    const cell = cellFromEvent(
      event,
      canvasElement,
      pageCenter,
      cellSize,
      cellHeight
    )
    const templateW = template.w
    const templateH = template.h

    const bestPos = findNearestFreePosition(
      cell,
      { w: templateW, h: templateH },
      widgets,
      20
    )

    if (bestPos) {
      const widget = {
        id: makeId(template.type),
        type: template.type,
        title: template.title,
        x: bestPos.x,
        y: bestPos.y,
        w: templateW,
        h: templateH,
        config: structuredClone(template.config || {})
      }
      if (template.children)
        widget.children = structuredClone(template.children)
      config.dashboard.widgets = [...widgets, widget]
      dirty = true
      gridActive = false
      toast.info(m.editor_widget_added())
    } else {
      gridActive = false
      toast.error(m.editor_grid_full())
    }
  }

  function onDragOver(event) {
    if (!editMode) return
    if (draggingTemplateType === 'button' || draggingWidgetId) {
      event.dataTransfer.dropEffect = 'none'
      return
    }
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  function endTemplateDrag() {
    gridActive = false
    draggingTemplateType = null
    draggingWidgetId = null
  }

  function dropIntoStack(event, stack) {
    event.preventDefault()
    event.stopPropagation()
    gridActive = false
    if (
      !editMode ||
      !['stack', 'stack-horizontal', 'stack-vertical'].includes(stack.type)
    )
      return

    const templateRaw = event.dataTransfer.getData(
      'application/x-magma-template'
    )
    const widgetId = event.dataTransfer.getData('application/x-magma-widget-id')

    if (templateRaw) {
      const template = JSON.parse(templateRaw)
      if (template.type !== 'button') {
        toast.error(m.editor_only_in_stack())
        return
      }

      const child = {
        id: makeId(template.type),
        type: template.type,
        title: template.title,
        config: structuredClone(template.config || {})
      }
      addChildToStack(stack.id, child)
      toast.info(m.editor_button_added_stack())
      return
    }

    if (widgetId) {
      const widget = widgets.find((item) => item.id === widgetId)
      if (!widget || widget.type !== 'button' || widget.id === stack.id) return
      const child = {
        id: widget.id,
        type: widget.type,
        title: widget.title,
        config: structuredClone(widget.config || {})
      }
      config.dashboard.widgets = widgets
        .filter((item) => item.id !== widget.id)
        .map((item) =>
          item.id === stack.id
            ? { ...item, children: [...(item.children || []), child] }
            : item
        )
      selected = { id: stack.id, childId: child.id }
      dirty = true
      toast.info(m.editor_button_moved_stack())
    }
  }

  function dragOverStack(event) {
    if (!editMode) return
    const acceptsDrop =
      draggingTemplateType === 'button' || Boolean(draggingWidgetId)

    if (!acceptsDrop) return
    event.preventDefault()
    event.stopPropagation()
    event.dataTransfer.dropEffect = draggingWidgetId ? 'move' : 'copy'
  }

  function startMove(event, widget) {
    if (!editMode) return
    event.preventDefault()
    const start = cellFromEvent(
      event,
      canvasElement,
      pageCenter,
      cellSize,
      cellHeight
    )
    const original = { x: widget.x, y: widget.y }
    draftWidget = widget.id
    gridActive = true

    function move(moveEvent) {
      const cell = cellFromEvent(
        moveEvent,
        canvasElement,
        pageCenter,
        cellSize,
        cellHeight
      )
      updateWidget(widget.id, {
        x: original.x + cell.x - start.x,
        y: Math.max(1, original.y + cell.y - start.y)
      })
    }

    function stop() {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
      draftWidget = null
      gridActive = false
      dirty = true
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
  }

  function startResize(event, widget) {
    if (!editMode) return
    event.preventDefault()
    const start = cellFromEvent(
      event,
      canvasElement,
      pageCenter,
      cellSize,
      cellHeight
    )
    const original = { w: widget.w, h: widget.h }
    draftWidget = widget.id
    gridActive = true

    function move(moveEvent) {
      const cell = cellFromEvent(
        moveEvent,
        canvasElement,
        pageCenter,
        cellSize,
        cellHeight
      )
      updateWidget(widget.id, {
        w: Math.max(1, original.w + cell.x - start.x),
        h: Math.max(1, original.h + cell.y - start.y)
      })
    }

    function stop() {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
      draftWidget = null
      gridActive = false
      dirty = true
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
  }

  function updateWidget(id, patch) {
    config.dashboard.widgets = widgets.map((widget) => {
      if (widget.id !== id) return widget
      const next = { ...widget, ...patch }
      return canPlace(next, widgets, id) ? next : widget
    })
  }

  function addChildToStack(stackId, child) {
    config.dashboard.widgets = widgets.map((widget) =>
      widget.id === stackId
        ? { ...widget, children: [...(widget.children || []), child] }
        : widget
    )
    selected = { id: stackId, childId: child.id }
    dirty = true
  }

  function deleteWidget(widget, childId = null) {
    if (!editMode) return

    if (childId) {
      config.dashboard.widgets = widgets.map((item) =>
        item.id === widget.id
          ? {
              ...item,
              children: (item.children || []).filter(
                (child) => child.id !== childId
              )
            }
          : item
      )
      selected = null
      dirty = true
      toast.info(m.editor_widget_deleted())
      return
    }

    config.dashboard.widgets = widgets.filter((item) => item.id !== widget.id)
    if (selected?.id === widget.id) selected = null
    dirty = true
    toast.info(m.editor_widget_deleted())
  }

  function getSelectedWidget() {
    if (!selected) return null
    const parent = widgets.find((widget) => widget.id === selected.id)
    if (!parent) return null
    if (!selected.childId) return parent
    return (
      parent.children?.find((child) => child.id === selected.childId) || null
    )
  }

  function selectWidget(event, widget, childId = null) {
    if (!editMode) return
    event.preventDefault()
    event.stopPropagation()
    selected = { id: widget.id, childId }
    drawerOpen = false
  }

  function updateSelected(patch) {
    if (!selected) return

    if (selected.childId) {
      config.dashboard.widgets = widgets.map((widget) => {
        if (widget.id !== selected.id) return widget
        return {
          ...widget,
          children: (widget.children || []).map((child) =>
            child.id === selected.childId ? { ...child, ...patch } : child
          )
        }
      })
      dirty = true
      return
    }

    const current = widgets.find((widget) => widget.id === selected.id)
    if (!current) return
    const next = { ...current, ...patch }
    if (!canPlace(next, widgets, selected.id)) {
      toast.error(m.editor_properties_dont_fit())
      return
    }

    config.dashboard.widgets = widgets.map((widget) =>
      widget.id === selected.id ? next : widget
    )
    dirty = true
  }

  function updateSelectedConfig(key, value) {
    if (!selectedWidget) return
    updateSelected({
      config: {
        ...(selectedWidget.config || {}),
        [key]: value
      }
    })
  }

  function updateSelectedNumber(key, value) {
    const number = Number(value)
    if (!Number.isFinite(number)) return
    updateSelected({ [key]: Math.round(number) })
  }

  // canPlace, overlaps, clamp moved to $lib/dashboard/grid-utils.js

  async function save() {
    saving = true
    try {
      const data = await saveDashboardConfig({ config })
      config = data.config
      dirty = false
      toast.success(m.editor_dashboard_saved())
      return true
    } catch (saveError) {
      toast.error(saveError.message)
      return false
    } finally {
      saving = false
    }
  }

  async function toggleEditMode() {
    if (!editMode) {
      editMode = true
      toast.info(m.editor_edit_mode())
      return
    }

    if (dirty) {
      const saved = await save()
      if (!saved) return
    }

    editMode = false
    drawerOpen = false
    gridActive = false
    draftWidget = null
    draggingTemplateType = null
    draggingWidgetId = null
    selected = null
  }
</script>

<section
  class="relative min-h-screen p-6 text-magma-text max-sm:p-4.5"
  style={`--magma-accent: ${config.theme?.accentColor || '#fabd2f'}; --magma-bg: url('${config.theme?.backgroundImage || '/bg.jpg'}');`}
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
      title={m.editor_settings()}
      aria-label={m.editor_settings()}><Settings size={20} /></Button
    >
    <Button variant="magma" aria-pressed={editMode} onclick={toggleEditMode}>
      {#if editMode}
        <Save size={18} /> {m.editor_save()}
      {:else}
        <Pencil size={18} /> {m.editor_edit()}
      {/if}
    </Button>
    {#if editMode}
      <Button variant="magma" onclick={() => (drawerOpen = true)}>
        <Plus size={18} />
        {m.editor_add_widget()}
      </Button>
    {/if}
  </nav>

  <div
    bind:this={canvasElement}
    class:edit-mode={editMode}
    class:grid-active={editMode}
    class="dashboard-grid relative z-1 w-screen -ml-6 border-0 rounded-none bg-transparent overflow-visible"
    role="application"
    aria-label={m.editor_settings()}
    ondrop={onDrop}
    ondragover={onDragOver}
    style={`--columns: ${grid.columns}; --cell-size-x: ${cellSize}px; --cell-size-y: ${cellHeight}px; min-height: ${gridVisualHeight}px; background-position: ${pageCenter % cellSize}px 0;`}
  >
    {#if browser}
      {#each widgets as widget (widget.id)}
        <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions, a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class:dragging={draftWidget === widget.id}
          class:selected={selected?.id === widget.id && !selected?.childId}
          class="absolute p-1.5 animate-in fade-in duration-200"
          draggable={editMode && widget.type === 'button'}
          style={widgetStyle(widget, pageCenter, cellSize, cellHeight)}
          onclick={(event) => selectWidget(event, widget)}
          onkeydown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              selectWidget(event, widget)
            }
          }}
          ondragstart={(event) => dragWidget(event, widget)}
          ondragend={endTemplateDrag}
          tabindex={editMode ? 0 : -1}
        >
          {#if editMode}
            <Button
              class={`absolute top-1.5 left-1.5 right-1.5 z-3 flex items-center justify-center gap-1.5 h-7 border-0 rounded-t-lg text-xs font-extrabold cursor-grab transition-opacity duration-100 focus-visible:opacity-100 active:cursor-grabbing ${editMode ? 'opacity-100' : 'opacity-0'}`}
              draggable={widget.type === 'button'}
              ondragstart={(event) => dragWidget(event, widget)}
              ondragend={endTemplateDrag}
              onpointerdown={(event) => startMove(event, widget)}
            >
              <GripHorizontal size={16} />
            </Button>
            <Button
              class={`absolute top-1.5 right-1.5 z-5 grid size-7 ${editMode ? 'opacity-100' : 'opacity-0'}`}
              aria-label={m.editor_delete_widget()}
              variant="ghost"
              title={m.editor_delete_widget()}
              onclick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                deleteWidget(widget)
              }}
            >
              <Trash2 size={14} />
            </Button>
          {/if}
          <div
            class={`flex w-full h-full min-w-0 min-h-0 overflow-hidden border border-magma-line rounded-lg backdrop-blur-md ${editMode ? 'bg-magma-panel-strong shadow-[0_0_0_1px_rgb(250_189_47/24%),0_18px_46px_rgb(0_0_0/26%)]' : 'bg-magma-panel shadow-[0_12px_34px_rgb(0_0_0/16%)]'}`}
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
              class={`absolute right-1 bottom-1 z-4 grid size-7 text-magma-text cursor-nwse-resize focus-visible:opacity-100 ${editMode ? 'opacity-100' : 'opacity-0'}`}
              onpointerdown={(event) => startResize(event, widget)}
              variant="ghost"
            >
              <ArrowDownRight size={14} />
            </Button>
          {/if}
        </div>
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
</section>
