<script lang="ts">
  import { Fingerprint, X } from '@lucide/svelte'
  import { Button } from '$lib/components/ui/button/index.js'
  import { toast } from 'svelte-sonner'
  import { authenticateBegin } from '$lib/remotes/passkey.remote.js'

  let {
    open = false,
    onSuccess,
    onClose,
  }: {
    open?: boolean
    onSuccess: () => void
    onClose: () => void
  } = $props()

  let authenticating = $state(false)

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

  async function handleAuthenticate() {
    if (authenticating) return
    authenticating = true
    try {
      const origin = window.location.origin
      const rpID = window.location.hostname
      const { challengeId, options } = await authenticateBegin({ origin, rpID })

      // Convert base64url strings from the server to BufferSource for the browser API
      const publicKey = {
        ...options,
        challenge: base64urlToBufferSource(options.challenge),
        allowCredentials: options.allowCredentials?.map((cred: any) => ({
          ...cred,
          id: base64urlToBufferSource(cred.id),
        })),
      } as PublicKeyCredentialRequestOptions

      const assertion = await navigator.credentials.get({
        publicKey,
      }) as PublicKeyCredential | null
      if (!assertion) throw new Error('Passkey authentication cancelled')

      const response = await fetch('/api/auth/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId,
          credential: assertion.toJSON(),
          origin,
          rpID,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Authentication failed')
      }

      toast.success('Verified with passkey')
      onSuccess()
    } catch (err) {
      if (err instanceof Error && err.message === 'Passkey authentication cancelled') return
      toast.error(err instanceof Error ? err.message : 'Failed to authenticate')
    } finally {
      authenticating = false
    }
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    onclick={onClose}
    onkeydown={(e) => e.key === 'Escape' && onClose()}
    role="presentation"
  >
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="relative border border-border rounded-xl bg-card shadow-[0_24px_80px_rgb(0_0_0/32%)] backdrop-blur-xl p-8 max-w-sm w-full mx-4 text-center"
      onclick={(e) => e.stopPropagation()}
      onkeydown={() => {}}
      role="dialog"
      aria-modal="true"
      aria-label="Passkey verification"
      tabindex="-1"
    >
      <Button
        variant="ghost"
        class="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        onclick={onClose}
      >
        <X size={18} />
      </Button>

      <Fingerprint size={64} class="mx-auto text-accent mb-4" />

      <h2 class="text-foreground text-lg font-bold mb-2">Verify your identity</h2>
      <p class="text-muted-foreground text-sm mb-6">
        Use your passkey to continue
      </p>

      <Button
        variant="magma"
        class="w-full"
        onclick={handleAuthenticate}
        disabled={authenticating}
      >
        {authenticating ? 'Verifying...' : 'Use Passkey'}
      </Button>
    </div>
  </div>
{/if}
