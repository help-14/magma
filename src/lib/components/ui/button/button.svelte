<script module>
  // @ts-nocheck
  import { cn } from '$lib/utils.js'
  import { tv } from 'tailwind-variants'

  export const buttonVariants = tv({
    base: "rounded-lg border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-3 active:not-aria-[haspopup]:translate-y-px [&_svg:not([class*='size-'])]:size-4 group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:outline-2 focus-visible:outline-magma-accent focus-visible:outline-offset-2 transition-colors",
    variants: {
      variant: {
        default:
          'border-magma-line bg-magma-panel text-magma-text backdrop-blur-md hover:border-magma-accent/48 hover:bg-magma-accent/18 hover:shadow-[0_10px_26px_rgb(0_0_0/24%),0_0_0_1px_rgb(250_189_47/14%)] hover:-translate-y-0.5 active:shadow-[0_4px_12px_rgb(0_0_0/22%)] active:translate-y-0 active:scale-[0.97] aria-pressed:border-magma-accent/48 aria-pressed:bg-magma-accent/88',
        outline:
          'border-magma-line bg-transparent text-magma-text backdrop-blur-md hover:border-magma-accent/48 hover:bg-magma-accent/12 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]',
        secondary:
          'border-magma-line bg-magma-panel-strong text-magma-text backdrop-blur-md hover:border-magma-accent/48 hover:bg-magma-accent/18 hover:shadow-[0_10px_26px_rgb(0_0_0/24%),0_0_0_1px_rgb(250_189_47/14%)] hover:-translate-y-0.5 active:shadow-[0_4px_12px_rgb(0_0_0/22%)] active:translate-y-0 active:scale-[0.97] aria-pressed:border-magma-accent/48 aria-pressed:bg-magma-accent/88',
        magma:
          'border-magma-line bg-magma-panel text-magma-text backdrop-blur-md min-h-11 gap-2 hover:border-magma-accent/48 hover:bg-magma-accent/18 hover:shadow-[0_10px_26px_rgb(0_0_0/24%),0_0_0_1px_rgb(250_189_47/14%)] hover:-translate-y-0.5 active:shadow-[0_4px_12px_rgb(0_0_0/22%)] active:translate-y-0 active:scale-[0.97] aria-pressed:border-magma-accent/48 aria-pressed:bg-magma-accent/88',
        ghost:
          'border-transparent bg-transparent text-magma-text hover:bg-white/10 ',
        destructive:
          'border-red-400/30 bg-red-400/10 text-magma-text backdrop-blur-md hover:border-red-400/50 bg-red-800 hover:bg-red-400 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]',
        link: 'border-transparent bg-transparent text-magma-accent underline-offset-4 hover:underline hover:text-magma-accent/80'
      },
      size: {
        default:
          'h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        icon: 'size-8',
        'icon-xs':
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        'icon-sm':
          'size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg',
        'icon-lg': 'size-9'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  })
</script>

<script>
  // @ts-nocheck
  let {
    class: className,
    variant = 'default',
    size = 'default',
    ref = $bindable(null),
    href = undefined,
    type = 'button',
    disabled,
    children,
    ...restProps
  } = $props()
</script>

{#if href}
  <a
    bind:this={ref}
    data-slot="button"
    class={cn(buttonVariants({ variant, size }), className)}
    href={disabled ? undefined : href}
    aria-disabled={disabled}
    role={disabled ? 'link' : undefined}
    tabindex={disabled ? -1 : undefined}
    {...restProps}
  >
    {@render children?.()}
  </a>
{:else}
  <button
    bind:this={ref}
    data-slot="button"
    class={cn(buttonVariants({ variant, size }), className)}
    {type}
    {disabled}
    {...restProps}
  >
    {@render children?.()}
  </button>
{/if}
