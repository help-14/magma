import {
	generateRegistrationOptions,
	verifyRegistrationResponse,
	generateAuthenticationOptions,
	verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import type { AuthenticatorTransportFuture } from '@simplewebauthn/server'
import { store } from './config.js'

export type PasskeyEntry = {
	id: string
	label: string
	publicKey: string
	algorithm: number
	transports: string[]
	created: string
	lastUsed: string
	counter: number
}

export async function beginRegistration(origin: string, rpID: string) {
	const existing = await store.readPasskeys()
	const options = await generateRegistrationOptions({
		rpName: 'Magma',
		rpID,
		userName: 'Admin',
		attestationType: 'none',
		excludeCredentials: existing.map((pk: PasskeyEntry) => ({
			id: pk.id,
			type: 'public-key' as const,
			transports: pk.transports as AuthenticatorTransportFuture[],
		})),
	})
	return options
}

export async function verifyAndSaveRegistration(
	challenge: string,
	credential: any,
	label: string,
	origin: string,
	rpID: string,
) {
	const verification = await verifyRegistrationResponse({
		response: credential,
		expectedChallenge: challenge,
		expectedOrigin: origin,
		expectedRPID: rpID,
	})
	if (!verification.verified || !verification.registrationInfo) {
		throw new Error('Passkey registration failed')
	}
	const { credential: regCred } = verification.registrationInfo
	const id = regCred.id
	const publicKey = Buffer.from(regCred.publicKey).toString('base64url')
	const entry: PasskeyEntry = {
		id,
		label,
		publicKey,
		algorithm: credential.response.publicKeyAlgorithm,
		transports: credential.response.transports ?? [],
		created: new Date().toISOString(),
		lastUsed: new Date().toISOString(),
		counter: regCred.counter,
	}
	const passkeys = await store.readPasskeys()
	passkeys.push(entry)
	await store.writePasskeys(passkeys)
}

export async function beginAuthentication(origin: string, rpID: string) {
	const passkeys = await store.readPasskeys()
	const options = await generateAuthenticationOptions({
		rpID,
		allowCredentials: passkeys.map((pk: PasskeyEntry) => ({
			id: pk.id,
			type: 'public-key' as const,
			transports: pk.transports as AuthenticatorTransportFuture[],
		})),
		userVerification: 'preferred',
	})
	return options
}

export async function verifyAuthentication(
	challenge: string,
	credential: any,
	origin: string,
	rpID: string,
): Promise<{ label: string }> {
	const passkeys = await store.readPasskeys()
	const matching = passkeys.find(
		(pk: PasskeyEntry) => pk.id === credential.id,
	)
	if (!matching) throw new Error('Unknown passkey')
	const verification = await verifyAuthenticationResponse({
		response: credential,
		expectedChallenge: challenge,
		expectedOrigin: origin,
		expectedRPID: rpID,
		credential: {
			id: matching.id,
			publicKey: new Uint8Array(Buffer.from(matching.publicKey, 'base64url')),
			counter: matching.counter,
			transports: matching.transports as AuthenticatorTransportFuture[],
		},
	})
	if (!verification.verified) {
		throw new Error('Passkey authentication failed')
	}
	matching.counter = verification.authenticationInfo.newCounter
	matching.lastUsed = new Date().toISOString()
	const updated = passkeys.map((pk: PasskeyEntry) =>
		pk.id === matching.id ? matching : pk,
	)
	await store.writePasskeys(updated)
	return { label: matching.label }
}
