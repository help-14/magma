import { m } from '$lib/paraglide/messages.js'

export const ErrorCode = {
  AUTH_CANCELLED: 'AUTH_CANCELLED',
  PASSKEY_CREATION_CANCELLED: 'PASSKEY_CREATION_CANCELLED',
  PASSKEY_AUTH_CANCELLED: 'PASSKEY_AUTH_CANCELLED',
  AUTH_FAILED: 'AUTH_FAILED',
  CHALLENGE_EXPIRED: 'CHALLENGE_EXPIRED',
  PASSKEY_NOT_FOUND: 'PASSKEY_NOT_FOUND',
  REPO_NOT_CONFIGURED: 'REPO_NOT_CONFIGURED',
  INVALID_REPO_FORMAT: 'INVALID_REPO_FORMAT',
  REPO_NOT_FOUND: 'REPO_NOT_FOUND',
  GITHUB_API_ERROR: 'GITHUB_API_ERROR',
  INVALID_JSON: 'INVALID_JSON',
  API_ERROR: 'API_ERROR',
  INVALID_FEEDS_JSON: 'INVALID_FEEDS_JSON',
  FETCH_FAILED: 'FETCH_FAILED',
  NO_DATA: 'NO_DATA',
  PRICE_UNAVAILABLE: 'PRICE_UNAVAILABLE',
  NO_STOCKS: 'NO_STOCKS',
  NO_ORGANIZATIONS: 'NO_ORGANIZATIONS',
  NO_VIDEOS: 'NO_VIDEOS',
  NO_ENTRIES: 'NO_ENTRIES',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode]

function isErrorCode(value: string): value is ErrorCode {
  return Object.values(ErrorCode).includes(value as ErrorCode)
}

export function toErrorMessage(code: string): string {
  switch (code) {
    case ErrorCode.AUTH_CANCELLED:
      return m.error_auth_cancelled()
    case ErrorCode.PASSKEY_CREATION_CANCELLED:
      return m.error_passkey_creation_cancelled()
    case ErrorCode.PASSKEY_AUTH_CANCELLED:
      return m.error_passkey_auth_cancelled()
    case ErrorCode.AUTH_FAILED:
      return m.error_auth_failed()
    case ErrorCode.CHALLENGE_EXPIRED:
      return m.error_challenge_expired()
    case ErrorCode.PASSKEY_NOT_FOUND:
      return m.error_passkey_not_found()
    case ErrorCode.REPO_NOT_CONFIGURED:
      return m.error_repo_not_configured()
    case ErrorCode.INVALID_REPO_FORMAT:
      return m.error_invalid_repo_format()
    case ErrorCode.INVALID_JSON:
      return m.error_invalid_json()
    case ErrorCode.API_ERROR:
      return m.error_api_error()
    case ErrorCode.INVALID_FEEDS_JSON:
      return m.error_invalid_feeds_json()
    case ErrorCode.FETCH_FAILED:
      return m.error_fetch_failed()
    case ErrorCode.NO_DATA:
      return m.error_no_data()
    case ErrorCode.PRICE_UNAVAILABLE:
      return m.error_price_unavailable()
    case ErrorCode.NO_STOCKS:
      return m.error_no_stocks()
    case ErrorCode.NO_ORGANIZATIONS:
      return m.error_no_organizations()
    case ErrorCode.NO_VIDEOS:
      return m.error_no_videos()
    case ErrorCode.NO_ENTRIES:
      return m.error_no_entries()
    case ErrorCode.NETWORK_ERROR:
      return m.error_network_error()
    default:
      return code
  }
}
