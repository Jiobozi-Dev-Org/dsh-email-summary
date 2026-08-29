/**
 * Host service: summarize a conversation and email it over SMTP, with a
 * durable settings namespace, a credential-backed password, per-session
 * auto-send arming, and a generated Client Remote (`remote.emailSummary`).
 * @module @deepseek-ai/dsh-email-summary
 */

import { Context } from '@deepseek-ai/cordis'
// Type-only: pull the Context/Events merges these services and the agent
// lifecycle declare (ctx.sessionQuery, ctx.agentDefaultModel, `agent/status`).
import type {} from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-agent-default-model'
import type {} from '@deepseek-ai/dsh-session-query'
// Type-only: pulls the timer mixin merge (ctx.timeout / ctx.interval).
import type {} from '@deepseek-ai/cordis-plugin-timer'
import { TypertRemoteService, Remote } from '@deepseek-ai/dsh-typert-protocol'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'
import { credentialRef } from '@deepseek-ai/dsh-credentials'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import {
  EMAIL_SUMMARY_SETTINGS_NAMESPACE,
  EmailSummarySettingsSchema,
  DEFAULT_EMAIL_SETTINGS,
  EMAIL_PROVIDER_PRESETS,
  presetById,
} from './spec.ts'
import { sendSmtpMail } from './smtp.ts'
import { buildTranscript, capTranscript, generateSummary, markdownToHtml, buildEmailHtml, defaultSystemPrompt } from './summary.ts'
import { formatChineseDate, msUntilNextReport, reportPeriodStart } from './report.ts'
import type {
  ArmAutosendRequest,
  ArmAutosendResult,
  EmailProviderPreset,
  EmailStatusResult,
  EmailSummarySettings,
  SendEmailRequest,
  SendEmailResult,
} from './types.ts'

export type * from './types.ts'
export { EMAIL_PROVIDER_PRESETS, EMAIL_SUMMARY_SETTINGS_NAMESPACE, DEFAULT_EMAIL_SETTINGS } from './spec.ts'

/** Environment-variable name for the SMTP password. */
const SMTP_PASSWORD_ENV = 'EMAIL_SMTP_PASSWORD'

declare module '@deepseek-ai/cordis' {
  interface Context {
    emailSummary: EmailSummaryService
  }
}

/** Resolved SMTP + summary configuration for one send. */
interface ResolvedMail {
  host: string
  port: number
  secure: 'starttls' | 'ssl' | 'none'
  username: string
  password: string
  from: string
  style: 'brief' | 'detailed'
  defaultRecipient: string
  prompt: string
}

/** Host service for conversation summarization + SMTP delivery. */
export class EmailSummaryService extends TypertRemoteService {
  static inject = ['llm', 'sessionQuery', 'settings', 'credentials', 'agentDefaultModel', 'timer']

  /** Session ids currently armed for auto-send, with an optional recipient override. */
  private readonly armed = new Map<SessionId, string | undefined>()

  /** Disposer of the currently scheduled periodic report, when armed. */
  private reportTimer: (() => void) | undefined

  /** The durable settings scope (structural type; matches `SettingsScope<T>`). */
  private readonly settingsScope: { get(): EmailSummarySettings }

  constructor(ctx: Context) {
    super(ctx, 'emailSummary')
    this.settingsScope = ctx.settings.register(
      settingsNamespace(EMAIL_SUMMARY_SETTINGS_NAMESPACE),
      EmailSummarySettingsSchema,
      { base: DEFAULT_EMAIL_SETTINGS },
    ) as { get(): EmailSummarySettings }

    ctx.on('agent/status', (payload) => {
      if (payload.status !== 'idle') return
      const recipient = this.armed.get(payload.agent.id)
      if (recipient === undefined && !this.armed.has(payload.agent.id)) return
      this.armed.delete(payload.agent.id)
      void this.summarizeAndSend(payload.agent.id, recipient, undefined, undefined).catch(() => {
        // Auto-send failures are non-fatal to the agent turn; the button path reports errors.
      })
    })

    this.scheduleReport()
    ctx.on('settings/updated', (ns) => {
      if (ns === settingsNamespace(EMAIL_SUMMARY_SETTINGS_NAMESPACE)) this.scheduleReport()
    })
  }

  /** Resolve effective mail configuration from settings + the credential password. */
  private async resolveMail(): Promise<ResolvedMail> {
    const raw = this.settingsScope.get() ?? DEFAULT_EMAIL_SETTINGS
    const preset = presetById(raw.provider)
    const host = preset !== undefined ? preset.host : raw.smtpHost
    const port = preset !== undefined ? preset.port : raw.smtpPort
    const secure = (preset !== undefined ? preset.secure : raw.secure) as 'starttls' | 'ssl' | 'none'
    const resolved = await this.ctx.credentials.resolve(credentialRef(SMTP_PASSWORD_ENV))
    const password = resolved?.value ?? ''
    const from = raw.from !== '' ? raw.from : raw.username
    return {
      host,
      port,
      secure,
      username: raw.username,
      password,
      from,
      style: raw.style === 'brief' ? 'brief' : 'detailed',
      defaultRecipient: raw.defaultRecipient,
      prompt: raw.prompt,
    }
  }

  /** (Re)schedule the periodic report timer from the current settings. */
  private scheduleReport(): void {
    if (this.reportTimer !== undefined) {
      this.reportTimer()
      this.reportTimer = undefined
    }
    const raw = this.settingsScope.get() ?? DEFAULT_EMAIL_SETTINGS
    if (!raw.reportEnabled) return
    const delay = msUntilNextReport(raw.reportFrequency, raw.reportTime, raw.reportWeekday)
    this.reportTimer = this.ctx.timeout(() => {
      void this.sendReport().catch(() => {}).finally(() => { this.scheduleReport() })
    }, delay)
  }

  /** Summarize the sessions created in the current period and email the report. */
  private async sendReport(): Promise<void> {
    const raw = this.settingsScope.get() ?? DEFAULT_EMAIL_SETTINGS
    const mail = await this.resolveMail()
    if (mail.host === '' || mail.from === '' || mail.defaultRecipient === '') return
    const frequency = raw.reportFrequency === 'weekly' ? 'weekly' : 'daily'
    const periodStart = reportPeriodStart(frequency, new Date())

    const records = await this.ctx.sessionQuery.listSessions()
    const recent = records
      .filter(record => (record.header?.createdAt ?? 0) >= periodStart)
      .slice(-20)
    if (recent.length === 0) return

    const selection = this.ctx.agentDefaultModel.currentSelection()
    if (selection === undefined || selection.provider === '' || selection.model === '') return

    const sections: string[] = []
    for (const record of recent) {
      try {
        const surface = await this.ctx.sessionQuery.readSurface(record.header.id)
        const transcript = buildTranscript(surface.events)
        if (transcript.text.trim() === '') continue
        const summary = await generateSummary(
          this.ctx.llm,
          selection.provider,
          selection.model,
          capTranscript(transcript.text, 20000),
          'brief',
        )
        sections.push(markdownToHtml(`## ${summary.title}\n\n${summary.markdown}`))
      } catch { /* one session failing must not fail the whole report */ }
    }
    if (sections.length === 0) return

    const dateLabel = formatChineseDate(new Date())
    const reportName = frequency === 'weekly' ? '周报' : '日报'
    const html = buildEmailHtml(`${dateLabel} ${reportName}`, dateLabel, sections.join(''))
    await sendSmtpMail({
      host: mail.host,
      port: mail.port,
      secure: mail.secure,
      username: mail.username,
      password: mail.password,
      from: mail.from,
      to: mail.defaultRecipient,
      subject: `${dateLabel} dsh${reportName}`,
      html,
    })
  }

  /** Summarize one session and send it; throws on failure. */
  private async summarizeAndSend(
    sessionId: SessionId,
    recipient: string | undefined,
    subject: string | undefined,
    style: 'brief' | 'detailed' | undefined,
  ): Promise<SendEmailResult> {
    const mail = await this.resolveMail()
    const to = recipient && recipient !== '' ? recipient : mail.defaultRecipient
    if (to === '') throw new Error('未配置收件人：请在设置里填写默认收件人，或点击按钮时指定收件人。')
    if (mail.host === '') throw new Error('未配置 SMTP 主机：请在设置里选择邮箱预设或填写自定义主机。')
    if (mail.from === '') throw new Error('未配置发件人：请在设置里填写发件人邮箱。')

    const surface = await this.ctx.sessionQuery.readSurface(sessionId)
    const transcript = buildTranscript(surface.events)
    if (transcript.text.trim() === '') throw new Error('当前会话没有可总结的对话内容。')

    const selection = this.ctx.agentDefaultModel.currentSelection()
    if (selection === undefined || selection.provider === '' || selection.model === '') {
      throw new Error('无法解析可用的 LLM 模型（provider/model）。')
    }

    const summary = await generateSummary(
      this.ctx.llm,
      selection.provider,
      selection.model,
      capTranscript(transcript.text, 20000),
      style ?? mail.style,
      mail.prompt,
    )

    const dateLabel = formatChineseDate(new Date())
    const resolvedSubject = subject && subject !== ''
      ? subject
      : `${dateLabel}dsh开发笔记：${summary.title}`
    const html = buildEmailHtml(summary.title, dateLabel, markdownToHtml(summary.markdown))

    await sendSmtpMail({
      host: mail.host,
      port: mail.port,
      secure: mail.secure,
      username: mail.username,
      password: mail.password,
      from: mail.from,
      to,
      subject: resolvedSubject,
      html,
    })

    return {
      ok: true,
      recipient: to,
      subject: resolvedSubject,
      summaryChars: summary.markdown.length,
      transcriptChars: transcript.text.length,
      summary: summary.markdown,
    }
  }

  /** Summarize the current conversation and email it now. */
  @Remote('sendNow')
  async sendNow(request: SendEmailRequest): Promise<SendEmailResult> {
    try {
      return await this.summarizeAndSend(request.sessionId, request.recipient, request.subject, request.style)
    } catch (error) {
      return {
        ok: false,
        recipient: request.recipient ?? '',
        subject: request.subject ?? '',
        summaryChars: 0,
        transcriptChars: 0,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  /** Arm or disarm auto-send for one conversation. */
  @Remote('armAutosend')
  armAutosend(request: ArmAutosendRequest): ArmAutosendResult {
    if (request.enabled) {
      this.armed.set(request.sessionId, request.recipient && request.recipient !== '' ? request.recipient : undefined)
    } else {
      this.armed.delete(request.sessionId)
    }
    return { ok: true, armed: this.armed.has(request.sessionId) }
  }

  /** Read configuration + armed state for the settings surface and toggles. */
  @Remote('status')
  async status(request: { sessionId: SessionId }): Promise<EmailStatusResult> {
    const mail = await this.resolveMail()
    return {
      configured: mail.host !== '' && mail.from !== '',
      defaultRecipient: mail.defaultRecipient,
      armed: this.armed.has(request.sessionId),
      presets: [...EMAIL_PROVIDER_PRESETS],
    }
  }

  /** Read the raw persisted settings (the surface edits these). */
  @Remote('getSettings')
  async getSettings(): Promise<{ settings: EmailSummarySettings; presets: EmailProviderPreset[]; configured: boolean; defaultPrompts: { brief: string; detailed: string } }> {
    const raw = this.settingsScope.get() ?? DEFAULT_EMAIL_SETTINGS
    const mail = await this.resolveMail()
    return {
      settings: raw,
      presets: [...EMAIL_PROVIDER_PRESETS],
      configured: mail.host !== '' && mail.from !== '',
      defaultPrompts: {
        brief: defaultSystemPrompt('brief'),
        detailed: defaultSystemPrompt('detailed'),
      },
    }
  }

  /** Persist a partial settings patch. */
  @Remote('saveSettings')
  async saveSettings(request: { patch: Partial<EmailSummarySettings> }): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.ctx.settings.update(
        settingsNamespace(EMAIL_SUMMARY_SETTINGS_NAMESPACE),
        request.patch,
      )
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) }
    }
  }

  /** Store (or clear) the SMTP password through the credential seam. */
  @Remote('setPassword')
  async setPassword(request: { password: string }): Promise<{ ok: boolean; error?: string }> {
    try {
      const ref = credentialRef(SMTP_PASSWORD_ENV)
      if (request.password === '') await this.ctx.credentials.unset(ref)
      else await this.ctx.credentials.set(ref, request.password)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) }
    }
  }
}

export default EmailSummaryService
