---
description: Use passkeys to secure dashboard editing and settings access.
---

# Passkeys

Magma supports passkey authentication using WebAuthn (Web Authentication API). Passkeys use biometrics — Face ID, Touch ID, Windows Hello, or a platform PIN — to verify your identity before allowing edit mode and settings access.

## How it works

When at least one passkey is registered, the dashboard and settings pages prompt for passkey verification before granting access. This protects your configuration from unauthorized changes while keeping access convenient.

## Register a passkey

1. Open **Settings → Security**.
2. Click **Add Passkey**.
3. Complete the browser prompt (Face ID, Touch ID, Windows Hello, or PIN).
4. The passkey appears in the list with a label and creation date.

## Use a passkey

- **Dashboard edit mode:** Press the edit button — the passkey prompt appears before the editor opens.
- **Settings page:** Visiting settings triggers the passkey prompt automatically.

## Manage passkeys

Passkeys are listed under **Settings → Security**. You can:

- View registered passkeys with their labels and creation dates.
- Delete passkeys with the trash button.
- Register additional passkeys (e.g., one per device).

## Storage

Passkey credentials are stored in `config/passkey.yaml` using the `@simplewebauthn/server` library. Credential public keys and counters are persisted so the server can verify authentication challenges.

## Notes

- Passkeys are device-specific. Register a passkey on each device you want to use.
- Deleting all passkeys removes the authentication gate — the dashboard returns to unrestricted access.
- Passkey verification is handled entirely by the browser's platform authenticator; no external service or cloud provider is required.