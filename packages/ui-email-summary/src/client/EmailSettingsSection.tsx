/**
 * Email-summary plugin configuration card (shown in Settings → Plugins).
 * Collapsed by default, mirroring the shared PluginCard chrome so it sits
 * beside the built-in shell / agent-loop / web-search cards identically.
 * @module @deepseek-ai/dsh-client-ui-email-summary/client/EmailSettingsSection
 */

import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { IconChevronDownOutline14 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace } from '@deepseek-ai/dsh-client-ui-slots'
import type { EmailProviderPreset, EmailSummarySettings, ReportStatusResult } from '@deepseek-ai/dsh-email-summary/types'
import type { EmailSettingsInjected } from './types.ts'
import css from './EmailCard.module.css'

export type EmailSettingsSectionProps = InjectFace<EmailSettingsInjected>

const groupLabel: CSSProperties = { fontSize: 12, fontWeight: 600, color: '#2563eb', marginBottom: 2 }
const fieldLabel: CSSProperties = { fontSize: 13, fontWeight: 500 }
const fieldHint: CSSProperties = { fontSize: 11, opacity: 0.55 }
const input: CSSProperties = {
  padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.18)',
  fontSize: 14, background: '#fff', width: '100%', boxSizing: 'border-box',
}
const inlineRow: CSSProperties = { display: 'flex', gap: 14, minWidth: 0 }
const inlineCol: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }

/** A section header: the SMTP fields or the summary preference. */
function FieldGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={groupLabel}>{label}</div>
      {children}
    </div>
  )
}

/**
 * The collapsible configuration card.
 * @param props - the injected Remote and bound translator.
 */
export function EmailSettingsSection({ api, t }: EmailSettingsSectionProps) {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState<EmailSummarySettings | null>(null)
  const [presets, setPresets] = useState<EmailProviderPreset[]>([])
  const [password, setPassword] = useState('')
  const [defaultPrompts, setDefaultPrompts] = useState<{ brief: string; detailed: string }>({ brief: '', detailed: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [reportStatus, setReportStatus] = useState<ReportStatusResult | null>(null)
  const [reporting, setReporting] = useState(false)
  const [reportMessage, setReportMessage] = useState<string | null>(null)

  const refreshReportStatus = useCallback(() => {
    void api.reportStatus().then(setReportStatus)
  }, [api])

  const onReportNow = useCallback(() => {
    if (reporting) return
    setReporting(true)
    setReportMessage(null)
    void api.reportNow().then((result) => {
      setReporting(false)
      if (result.ok) setReportMessage(`${t('settings.reportNowSent')}（${result.count} 个会话）`)
      else setReportMessage(`${t('settings.reportNowFailed')}：${result.error ?? ''}`)
      refreshReportStatus()
    })
  }, [reporting, api, t, refreshReportStatus])

  useEffect(() => {
    let alive = true
    void api.getSettings().then((result) => {
      if (!alive) return
      setPresets(result.presets)
      setDefaultPrompts(result.defaultPrompts)
      // Pre-fill the prompt with the effective prompt (custom if set, else the
      // default for the current style) so the user can see and edit it.
      const style = result.settings.style === 'brief' ? 'brief' : 'detailed'
      setSettings({
        ...result.settings,
        prompt: (result.settings.prompt ?? '').trim() !== ''
          ? result.settings.prompt
          : result.defaultPrompts[style],
      })
    })
    void refreshReportStatus()
    return () => { alive = false }
  }, [api, refreshReportStatus])

  const patch = useCallback((partial: Partial<EmailSummarySettings>) => {
    setSettings(current => (current === null ? current : { ...current, ...partial }))
  }, [])

  const onProvider = useCallback((id: string) => {
    const preset = presets.find(item => item.id === id)
    if (preset !== undefined) {
      patch({ provider: id, smtpHost: preset.host, smtpPort: preset.port, secure: preset.secure })
    } else {
      patch({ provider: id })
    }
  }, [presets, patch])

  const restoreDefaultPrompt = useCallback(() => {
    if (settings === null) return
    const style = settings.style === 'brief' ? 'brief' : 'detailed'
    const def = defaultPrompts[style]
    if (def !== '') setSettings(current => (current === null ? current : { ...current, prompt: def }))
  }, [settings, defaultPrompts])

  const onStyleChange = useCallback((nextStyle: string) => {
    setSettings(current => {
      if (current === null) return current
      const style = nextStyle === 'brief' ? 'brief' : 'detailed'
      const currentPrompt = (current.prompt ?? '').trim()
      const isDefault = currentPrompt === ''
        || currentPrompt === defaultPrompts.brief.trim()
        || currentPrompt === defaultPrompts.detailed.trim()
      return { ...current, style, prompt: isDefault ? (defaultPrompts[style] ?? current.prompt) : current.prompt }
    })
  }, [defaultPrompts])

  const onSave = useCallback(() => {
    if (settings === null || saving) return
    setSaving(true)
    setMessage(null)
    void (async () => {
      // A prompt that is empty or equals the selected style's built-in default
      // is stored empty, so the summarizer keeps following the style default.
      const style = settings.style === 'brief' ? 'brief' : 'detailed'
      const def = (defaultPrompts[style] ?? '').trim()
      const promptText = (settings.prompt ?? '').trim()
      const customPrompt = promptText === '' || promptText === def ? '' : settings.prompt
      const patchValue = { ...settings, prompt: customPrompt }
      const saved = await api.saveSettings({ patch: patchValue })
      if (password !== '') await api.setPassword({ password })
      setSaving(false)
      setMessage(saved.ok ? t('settings.saved') : (saved.error ?? t('settings.error')))
      refreshReportStatus()
    })()
  }, [settings, saving, password, defaultPrompts, api, t, refreshReportStatus])

  const discard = useCallback(() => {
    if (saving) return
    setMessage(null)
    void api.getSettings().then((result) => {
      const style = result.settings.style === 'brief' ? 'brief' : 'detailed'
      setSettings({
        ...result.settings,
        prompt: (result.settings.prompt ?? '').trim() !== ''
          ? result.settings.prompt
          : result.defaultPrompts[style],
      })
      setPresets(result.presets)
      setDefaultPrompts(result.defaultPrompts)
      setPassword('')
      refreshReportStatus()
    })
  }, [saving, api, refreshReportStatus])

  if (settings === null) return null

  return (
    <li className={open ? `${css.card} ${css.cardOpen}` : css.card}>
      <button
        type="button"
        className={css.header}
        aria-expanded={open}
        onClick={() => { setOpen(!open) }}
      >
        <span className={css.headText}>
          <span className={css.name}>{t('nav')}</span>
          <span className={css.description}>{t('desc')}</span>
        </span>
        <IconChevronDownOutline14 className={open ? `${css.chevron} ${css.chevronOpen}` : css.chevron} />
      </button>

      {open && (
        <div className={css.body}>
          <FieldGroup label={t('settings.provider')}>
            <select style={input} value={settings.provider} onChange={event => onProvider(event.target.value)}>
              {presets.map(preset => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
            </select>
          </FieldGroup>

          <FieldGroup label={t('settings.host')}>
            <input style={input} value={settings.smtpHost} onChange={event => patch({ smtpHost: event.target.value })} />
            <div style={fieldHint}>{t('settings.hostHint')}</div>
          </FieldGroup>

          <div style={inlineRow}>
            <label style={inlineCol}>
              <span style={fieldLabel}>{t('settings.port')}</span>
              <input
                style={input}
                type="number"
                value={settings.smtpPort}
                onChange={event => patch({ smtpPort: Number(event.target.value) })}
              />
              <span style={fieldHint}>{t('settings.portHint')}</span>
            </label>
            <label style={inlineCol}>
              <span style={fieldLabel}>{t('settings.secure')}</span>
              <select
                style={input}
                value={settings.secure}
                onChange={event => patch({ secure: event.target.value as EmailSummarySettings['secure'] })}
              >
                <option value="starttls">STARTTLS</option>
                <option value="ssl">SSL</option>
                <option value="none">None</option>
              </select>
              <span style={fieldHint}>{t('settings.secureHint')}</span>
            </label>
          </div>

          <FieldGroup label={t('settings.username')}>
            <input style={input} value={settings.username} onChange={event => patch({ username: event.target.value })} />
            <div style={fieldHint}>{t('settings.usernameHint')}</div>
          </FieldGroup>

          <FieldGroup label={t('settings.password')}>
            <input
              style={input}
              type="password"
              value={password}
              placeholder={t('settings.passwordHint')}
              onChange={event => setPassword(event.target.value)}
            />
          </FieldGroup>

          <div style={inlineRow}>
            <label style={inlineCol}>
              <span style={fieldLabel}>{t('settings.from')}</span>
              <input style={input} value={settings.from} onChange={event => patch({ from: event.target.value })} />
              <span style={fieldHint}>{t('settings.fromHint')}</span>
            </label>
            <label style={inlineCol}>
              <span style={fieldLabel}>{t('settings.recipient')}</span>
              <input
                style={input}
                value={settings.defaultRecipient}
                onChange={event => patch({ defaultRecipient: event.target.value })}
              />
              <span style={fieldHint}>{t('settings.recipientHint')}</span>
            </label>
          </div>

          <FieldGroup label={t('settings.style')}>
            <select
              style={input}
              value={settings.style}
              onChange={event => onStyleChange(event.target.value as EmailSummarySettings['style'])}
            >
              <option value="detailed">{t('settings.detailed')}</option>
              <option value="brief">{t('settings.brief')}</option>
            </select>
            <div style={fieldHint}>{t('settings.styleHint')}</div>
          </FieldGroup>

          <FieldGroup label={t('settings.prompt')}>
            <textarea
              style={{ ...input, minHeight: 120, resize: 'vertical', fontFamily: 'ui-monospace,Consolas,monospace', fontSize: 13, lineHeight: 1.5 }}
              value={settings.prompt}
              placeholder={t('settings.promptPlaceholder')}
              onChange={event => patch({ prompt: event.target.value })}
            />
            <div style={fieldHint}>{t('settings.promptHint')}</div>
            <button type="button" style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: 'transparent', color: '#2563eb', fontSize: 12, cursor: 'pointer', alignSelf: 'flex-start' }} onClick={restoreDefaultPrompt}>
              {t('settings.restoreDefaultPrompt')}
            </button>
          </FieldGroup>

          <FieldGroup label={t('settings.report')}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={settings.reportEnabled}
                onChange={event => patch({ reportEnabled: event.target.checked })}
              />
              <span style={fieldLabel}>{t('settings.reportEnabled')}</span>
            </label>
            <div style={fieldHint}>{t('settings.reportHint')}</div>
            {settings.reportEnabled && (
              <>
                <div style={inlineRow}>
                  <label style={inlineCol}>
                    <span style={fieldLabel}>{t('settings.reportFrequency')}</span>
                    <select
                      style={input}
                      value={settings.reportFrequency}
                      onChange={event => patch({ reportFrequency: event.target.value })}
                    >
                      <option value="daily">{t('settings.daily')}</option>
                      <option value="weekly">{t('settings.weekly')}</option>
                    </select>
                  </label>
                  <label style={inlineCol}>
                    <span style={fieldLabel}>{t('settings.reportTime')}</span>
                    <input
                      type="time"
                      style={input}
                      value={/^\d{2}:\d{2}$/.test(settings.reportTime) ? settings.reportTime : '09:00'}
                      onChange={event => patch({ reportTime: event.target.value })}
                    />
                    <span style={fieldHint}>{t('settings.reportTimeHint')}</span>
                  </label>
                </div>
                <label style={inlineCol}>
                  <span style={fieldLabel}>{t('settings.reportWindow')}</span>
                  <select
                    style={input}
                    value={settings.reportWindow}
                    onChange={event => patch({ reportWindow: event.target.value })}
                  >
                    <option value="calendar">{t('settings.reportWindowCalendar')}</option>
                    <option value="rolling">{t('settings.reportWindowRolling')}</option>
                  </select>
                  <span style={fieldHint}>{t('settings.reportWindowHint')}</span>
                </label>
                {settings.reportFrequency === 'weekly' && (
                  <label style={inlineCol}>
                    <span style={fieldLabel}>{t('settings.reportWeekday')}</span>
                    <select
                      style={input}
                      value={settings.reportWeekday}
                      onChange={event => patch({ reportWeekday: Number(event.target.value) })}
                    >
                      {t('settings.weekdays').split(',').map((label, idx) => (
                        <option key={idx} value={idx}>{label}</option>
                      ))}
                    </select>
                  </label>
                )}
              </>
            )}
            {reportStatus !== null && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {reportStatus.enabled && reportStatus.nextFireAt !== undefined && (
                  <div style={fieldHint}>{t('settings.reportNext')}{new Date(reportStatus.nextFireAt).toLocaleString()}</div>
                )}
                {reportStatus.last !== undefined && (
                  <div style={reportStatus.last.ok ? fieldHint : { ...fieldHint, color: '#dc2626' }}>
                    {reportStatus.last.ok
                      ? `${t('settings.reportLastSent')}${new Date(reportStatus.last.at).toLocaleString()}`
                      : `${t('settings.reportLastFailed')}${reportStatus.last.error ?? ''}`}
                  </div>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={onReportNow}
              disabled={reporting}
              style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: 'transparent', color: '#2563eb', fontSize: 12, cursor: 'pointer', alignSelf: 'flex-start' }}
            >
              {reporting ? t('settings.reportNowPending') : t('settings.reportNow')}
            </button>
            {reportMessage !== null && <div role="status" style={fieldHint}>{reportMessage}</div>}
          </FieldGroup>

          <div className={css.footer}>
            {message !== null && <span className={css.failed} role="status">{message}</span>}
            <button type="button" className={css.discard} onClick={discard} disabled={saving}>
              {t('settings.discard')}
            </button>
            <button type="button" className={css.save} onClick={onSave} disabled={saving}>
              {saving ? t('settings.saving') : t('settings.save')}
            </button>
          </div>
        </div>
      )}
    </li>
  )
}
