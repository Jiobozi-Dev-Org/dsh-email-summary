/**
 * Email-summary settings page: provider preset, SMTP fields, password, and
 * summary preference, persisted through the `remote.emailSummary` Host Remote.
 * @module @deepseek-ai/dsh-client-ui-email-summary/client/EmailSettingsSection
 */

import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import type { InjectFace } from '@deepseek-ai/dsh-client-ui-slots'
import type { EmailProviderPreset, EmailSummarySettings } from '@deepseek-ai/dsh-email-summary/types'
import type { EmailSettingsInjected } from './types.ts'

export type EmailSettingsSectionProps = InjectFace<EmailSettingsInjected>

const row: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4 }
const field: CSSProperties = { padding: '6px 8px', borderRadius: 4 }

/**
 * A plain form: the provider select fills host/port/security from the preset;
 * Save writes settings and (when entered) the credential-backed password.
 * @param props - the injected Remote and bound translator.
 */
export function EmailSettingsSection({ api, t }: EmailSettingsSectionProps) {
  const [settings, setSettings] = useState<EmailSummarySettings | null>(null)
  const [presets, setPresets] = useState<EmailProviderPreset[]>([])
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    void api.getSettings().then((result) => {
      if (!alive) return
      setSettings(result.settings)
      setPresets(result.presets)
    })
    return () => { alive = false }
  }, [api])

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

  const onSave = useCallback(() => {
    if (settings === null || saving) return
    setSaving(true)
    setMessage(null)
    void (async () => {
      const saved = await api.saveSettings({ patch: settings })
      if (password !== '') await api.setPassword({ password })
      setSaving(false)
      setMessage(saved.ok ? t('settings.saved') : (saved.error ?? t('settings.error')))
    })()
  }, [settings, saving, password, api, t])

  if (settings === null) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560 }}>
      <label style={row}>
        <span>{t('settings.provider')}</span>
        <select
          style={field}
          value={settings.provider}
          onChange={event => onProvider(event.target.value)}
        >
          {presets.map(preset => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
        </select>
      </label>

      <label style={row}>
        <span>{t('settings.host')}</span>
        <input style={field} value={settings.smtpHost} onChange={event => patch({ smtpHost: event.target.value })} />
      </label>

      <div style={{ display: 'flex', gap: 14 }}>
        <label style={{ ...row, flex: 1 }}>
          <span>{t('settings.port')}</span>
          <input
            style={field}
            type="number"
            value={settings.smtpPort}
            onChange={event => patch({ smtpPort: Number(event.target.value) })}
          />
        </label>
        <label style={{ ...row, flex: 1 }}>
          <span>{t('settings.secure')}</span>
          <select
            style={field}
            value={settings.secure}
            onChange={event => patch({ secure: event.target.value as EmailSummarySettings['secure'] })}
          >
            <option value="starttls">STARTTLS</option>
            <option value="ssl">SSL</option>
            <option value="none">None</option>
          </select>
        </label>
      </div>

      <label style={row}>
        <span>{t('settings.username')}</span>
        <input style={field} value={settings.username} onChange={event => patch({ username: event.target.value })} />
      </label>

      <label style={row}>
        <span>{t('settings.password')}</span>
        <input
          style={field}
          type="password"
          value={password}
          placeholder={t('settings.passwordHint')}
          onChange={event => setPassword(event.target.value)}
        />
      </label>

      <label style={row}>
        <span>{t('settings.from')}</span>
        <input style={field} value={settings.from} onChange={event => patch({ from: event.target.value })} />
      </label>

      <label style={row}>
        <span>{t('settings.recipient')}</span>
        <input
          style={field}
          value={settings.defaultRecipient}
          onChange={event => patch({ defaultRecipient: event.target.value })}
        />
      </label>

      <label style={row}>
        <span>{t('settings.style')}</span>
        <select
          style={field}
          value={settings.style}
          onChange={event => patch({ style: event.target.value as EmailSummarySettings['style'] })}
        >
          <option value="detailed">{t('settings.detailed')}</option>
          <option value="brief">{t('settings.brief')}</option>
        </select>
      </label>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" onClick={onSave} disabled={saving}>
          {saving ? t('settings.saving') : t('settings.save')}
        </button>
        {message !== null && <span role="status">{message}</span>}
      </div>

      <p style={{ fontSize: 12, opacity: 0.7, margin: 0 }}>{t('settings.passwordHint')}</p>
    </div>
  )
}
