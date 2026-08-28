/**
 * Public request/result types for the email-summary Remote.
 * @module @deepseek-ai/dsh-email-summary/types
 */

import type { SessionId } from '@deepseek-ai/dsh-session/types'

/** Provider presets understood by the settings surface. */
export type EmailProviderId =
  | 'gmail'
  | 'qq'
  | '163'
  | '126'
  | 'outlook'
  | 'custom'

/** TLS mode for the SMTP connection. */
export type EmailSecureMode = 'starttls' | 'ssl' | 'none'

/** Summary detail level. */
export type EmailSummaryStyle = 'brief' | 'detailed'

/** One SMTP provider preset: the fields a preset selection fills in. */
export interface EmailProviderPreset {
  /** Provider id. */
  id: EmailProviderId
  /** Human-readable provider name. */
  label: string
  /** SMTP host. */
  host: string
  /** SMTP port. */
  port: number
  /** TLS mode. */
  secure: EmailSecureMode
}

/** The durable settings section shape (exposed as a Remote boundary type). */
export interface EmailSummarySettings {
  /** Selected provider preset id. */
  provider: string
  /** SMTP host (filled by preset or typed for `custom`). */
  smtpHost: string
  /** SMTP port. */
  smtpPort: number
  /** TLS mode (`starttls` | `ssl` | `none`). */
  secure: string
  /** SMTP login username (usually the sender address). */
  username: string
  /** Sender address. */
  from: string
  /** Default recipient used by auto-send and as a fallback for the button. */
  defaultRecipient: string
  /** Summary detail level (`brief` | `detailed`). */
  style: string
}

/** Send-one-summary request from the Client. */
export interface SendEmailRequest {
  /** Target conversation. */
  sessionId: SessionId
  /** Recipient; falls back to the configured default when omitted. */
  recipient?: string
  /** Subject; falls back to the first user message when omitted. */
  subject?: string
  /** Detail level; falls back to the configured default when omitted. */
  style?: EmailSummaryStyle
}

/** Send-one-summary result. */
export interface SendEmailResult {
  ok: boolean
  recipient: string
  subject: string
  summaryChars: number
  transcriptChars: number
  /** The generated Markdown summary (present on success). */
  summary?: string
  /** Failure reason (present when `ok` is false). */
  error?: string
}

/** Arm/disarm auto-send for one conversation. */
export interface ArmAutosendRequest {
  sessionId: SessionId
  enabled: boolean
  /** Optional recipient override; otherwise the configured default. */
  recipient?: string
}

/** Arm/disarm result. */
export interface ArmAutosendResult {
  ok: boolean
  armed: boolean
}

/** Configuration status read by the settings surface and toggles. */
export interface EmailStatusResult {
  /** Whether SMTP configuration is complete enough to send. */
  configured: boolean
  /** Default recipient from settings (empty when unset). */
  defaultRecipient: string
  /** Whether auto-send is currently armed for the given session. */
  armed: boolean
  /** Provider presets exposed for the settings surface. */
  presets: EmailProviderPreset[]
}
