/**
 * Client-side types for the email-summary surface: the unwrapped business API
 * face (RemoteResult already folded) and the injected faces each slot entry
 * receives.
 * @module @deepseek-ai/dsh-client-ui-email-summary/client/types
 */

import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type {
  EmailProviderPreset,
  EmailSummarySettings,
  SendEmailResult,
} from '@deepseek-ai/dsh-email-summary/types'
import type { EmailKey } from './locales.ts'

/**
 * Unwrapped business face of the generated `remote.emailSummary` namespace.
 * The carrier's `RemoteResult` wrapper is folded away so components read
 * plain results.
 */
export interface EmailSummaryApi {
  sendNow(request: {
    sessionId: SessionId
    recipient?: string
    subject?: string
    style?: 'brief' | 'detailed'
  }): Promise<SendEmailResult>
  armAutosend(request: { sessionId: SessionId; enabled: boolean; recipient?: string }): Promise<{ ok: boolean; armed: boolean }>
  status(request: { sessionId: SessionId }): Promise<{ configured: boolean; defaultRecipient: string; armed: boolean; presets: EmailProviderPreset[] }>
  getSettings(): Promise<{ settings: EmailSummarySettings; presets: EmailProviderPreset[]; configured: boolean; defaultPrompts: { brief: string; detailed: string } }>
  saveSettings(request: { patch: Partial<EmailSummarySettings> }): Promise<{ ok: boolean; error?: string }>
  setPassword(request: { password: string }): Promise<{ ok: boolean; error?: string }>
}

/** Injected face of one assistant-message "send email" action. */
export interface EmailSendInjected {
  t: (key: EmailKey) => string
  send: () => Promise<SendEmailResult>
}

/** Injected face of the composer auto-send toggle. */
export interface AutosendInjected {
  t: (key: EmailKey) => string
  api: EmailSummaryApi
  sessionId: SessionId
}

/** Injected face of the settings page. */
export interface EmailSettingsInjected {
  t: (key: EmailKey) => string
  api: EmailSummaryApi
}
