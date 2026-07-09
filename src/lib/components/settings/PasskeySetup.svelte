<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js'
  import { Trash2, Plus, KeyRound } from '@lucide/svelte'
  import { toast } from 'svelte-sonner'
  import {
    registerBegin,
    registerComplete,
    listPasskeys,
    deletePasskey
  } from '$lib/remotes/passkey.remote.js'

  let { onPasskeyChanged }: { onPasskeyChanged: () => void } = $props()

  let passkeys = $state<any[]>([])
  let loading = $state(true)
  let registering = $state(false)

  $effect(() => {
    loadPasskeys()
  })

  async function loadPasskeys() {
    loading = true
    try {
      const result = await listPasskeys()
      passkeys = result.passkeys
    } catch {
      passkeys = []
    } finally {
      loading = false
    }
  }

  function base64urlToBufferSource(base64url: string): BufferSource {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
    const padding = '='.repeat((4 - (base64.length % 4)) % 4)
    const binary = atob(base64 + padding)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes as BufferSource
  }

  async function handleAdd() {
    if (registering) return
    registering = true
    try {
      const origin = window.location.origin
      const rpID = window.location.hostname
      const { challengeId, options } = await registerBegin({ origin, rpID })

      // Convert base64url strings from the server to Uint8Array for the browser API
      const publicKey = {
        ...options,
        challenge: base64urlToBufferSource(options.challenge),
        user: {
          ...options.user,
          id: base64urlToBufferSource(options.user.id)
        }
      } as PublicKeyCredentialCreationOptions

      const credential = await navigator.credentials.create({
        publicKey
      })
      if (!credential) throw new Error('Passkey creation cancelled')

      const label = `${window.navigator.platform || 'Device'} (${new Date().toLocaleDateString()})`
      await registerComplete({
        challengeId,
        credential: (credential as PublicKeyCredential).toJSON(),
        label,
        origin,
        rpID
      })

      toast.success('Passkey registered')
      onPasskeyChanged()
      await loadPasskeys()
    } catch (err) {
      if (err instanceof Error && err.message === 'Passkey creation cancelled')
        return
      toast.error(
        err instanceof Error ? err.message : 'Failed to register passkey'
      )
    } finally {
      registering = false
    }
  }

  async function handleDelete(id: string) {
    try {
      await deletePasskey({ id })
      toast.success('Passkey deleted')
      onPasskeyChanged()
      await loadPasskeys()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete passkey'
      )
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
</script>

<div>
  {#if loading}
    <p class="text-muted-foreground text-sm">Loading passkeys...</p>
  {:else if passkeys.length === 0}
    <div class="flex flex-col items-center gap-4 py-8 text-muted-foreground">
      <KeyRound size={40} class="opacity-40" />
      <p class="text-sm">No passkeys registered</p>
      <Button variant="magma" onclick={handleAdd} disabled={registering}>
        <Plus size={16} />
        {registering ? 'Registering...' : 'Add Passkey'}
      </Button>
    </div>
  {:else}
    <div class="flex flex-col gap-2">
      {#each passkeys as pk (pk.id)}
        <div
          class="flex items-center justify-between gap-3 px-3 py-2 border border-border rounded-lg bg-[rgb(20_18_16/48%)]"
        >
          <div class="flex items-center gap-3 min-w-0">
            <KeyRound size={18} class="shrink-0 text-accent" />
            <div class="min-w-0">
              <p class="text-foreground text-sm truncate">{pk.label}</p>
              <p class="text-muted-foreground text-xs">
                Created {formatDate(pk.created)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            class="shrink-0 text-red-400 hover:text-red-300"
            onclick={() => handleDelete(pk.id)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      {/each}
      <Button
        variant="magma"
        onclick={handleAdd}
        disabled={registering}
        class="mt-2 self-start"
      >
        <Plus size={16} />
        {registering ? 'Registering...' : 'Add Another Passkey'}
      </Button>
    </div>
  {/if}
</div>
