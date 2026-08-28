/**
 * Email-summary surface plugin, browser half: a settings page, a per-message
 * "send email" action, and a composer auto-send toggle, all backed by the
 * generated `remote.emailSummary` Host Remote.
 * @module @deepseek-ai/dsh-client-ui-email-summary/client
 */

import type { ClientContext, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the generated Remote API and ctx.remote merge.
import type {} from '@deepseek-ai/dsh-api-remotes/client'
// Type-only: pulls the ui-conversation SlotMap merge (assistant-actions, input.right).
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// Type-only: pulls the plugin-configuration SlotMap merge (settings.plugin.item).
import type {} from '@deepseek-ai/dsh-client-ui-settings-plugins/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { EmailSendAction } from './EmailSendAction.tsx'
import { AutosendToggle } from './AutosendToggle.tsx'
import { EmailSettingsSection } from './EmailSettingsSection.tsx'
import { en, zh, type EmailKey } from './locales.ts'
import type {
  EmailSummaryApi,
  EmailSendInjected,
  AutosendInjected,
  EmailSettingsInjected,
} from './types.ts'

/** Dictionary namespace owned by this plugin. */
const NS = 'email'

/** Required services: the slot registry, the Remote namespace, and the copy. */
export const inject = ['slots', 'locale', 'remote', 'remote.emailSummary']

/** Read a Remote failure as a human-readable string. */
function errorText(failure: unknown): string {
  if (failure == null) return '远程调用失败'
  if (typeof failure === 'string') return failure
  const record = failure as { message?: unknown }
  return typeof record.message === 'string' ? record.message : '远程调用失败'
}

/**
 * Client plugin body: registers the settings page, the send action, and the
 * composer toggle once their owning slots are on the ledger.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-email-summary: dictionaries')

  const remote = ctx.remote.emailSummary
  const t = ctx.locale.bind(NS) as (key: EmailKey) => string

  // Fold the carrier's RemoteResult wrapper away so components read plain data.
  const api: EmailSummaryApi = {
    sendNow: request => remote.sendNow(request).then(result =>
      result.ok
        ? result.value
        : {
          ok: false,
          recipient: request.recipient ?? '',
          subject: request.subject ?? '',
          summaryChars: 0,
          transcriptChars: 0,
          error: errorText(result.error),
        }),
    armAutosend: request => remote.armAutosend(request).then(result =>
      result.ok ? result.value : { ok: false, armed: false }),
    status: request => remote.status(request).then(result =>
      result.ok ? result.value : { configured: false, defaultRecipient: '', armed: false, presets: [] }),
    getSettings: () => remote.getSettings().then((result) => {
      if (result.ok) return result.value
      throw new Error(errorText(result.error))
    }),
    saveSettings: request => remote.saveSettings(request).then(result =>
      result.ok ? result.value : { ok: false, error: errorText(result.error) }),
    setPassword: request => remote.setPassword(request).then(result =>
      result.ok ? result.value : { ok: false, error: errorText(result.error) }),
  }

  ctx.slots.inject('settings.plugin.item', () => {
    const dispose = ctx.slots.register({
      name: 'settings.plugin.item',
      key: 'email-summary',
      locale: NS,
      inject: (): EmailSettingsInjected => ({ api, t }),
    }, EmailSettingsSection)
    return () => dispose()
  })

  ctx.slots.inject('conversation.chat.assistant-actions', () => {
    const dispose = ctx.slots.register({
      name: 'conversation.chat.assistant-actions',
      id: 'email-summary',
      order: 20,
      locale: NS,
      inject: (sessionId: SessionId): EmailSendInjected => ({
        t,
        send: () => api.sendNow({ sessionId }),
      }),
    }, EmailSendAction)
    return () => dispose()
  })

  ctx.slots.inject('conversation.input.right', () => {
    const dispose = ctx.slots.register({
      name: 'conversation.input.right',
      id: 'email-summary',
      order: 0,
      locale: NS,
      inject: (sessionId: SessionId): AutosendInjected => ({ api, t, sessionId }),
    }, AutosendToggle)
    return () => dispose()
  })
}
