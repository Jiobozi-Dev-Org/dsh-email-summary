/**
 * Email-summary plugin configuration card (shown in Settings → Plugins).
 * Collapsed by default, like the built-in plugin cards; expanding reveals the
 * SMTP + summary form, whose fields are persisted through the Host Remote.
 * @module @deepseek-ai/dsh-client-ui-email-summary/client/EmailSettingsSection
 */

import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import type { InjectFace } from '@deepseek-ai/dsh-client-ui-slots'
import type { EmailProviderPreset, EmailSummarySettings } from '@deepseek-ai/dsh-email-summary/types'
import type { EmailSettingsInjected } from './types.ts'

export type EmailSettingsSectionProps = InjectFace<EmailSettingsInjected>

const card: CSSProperties = { margin: 0, padding: 0, listStyle: 'none' }
const headerBtn: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
  width: '100%', padding: '14px 16px', border: 'none', background: 'transparent',
  cursor: 'pointer', textAlign: 'left', color: 'inherit',
}
const headerText: CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }
const title: CSSProperties = { fontWeight: 600, fontSize: 15 }
const desc: CSSProperties = { fontSize: 12, opacity: 0.65 }
const chevron: CSSProperties = { fontSize: 12, opacity: 0.6, flexShrink: 0 }
const body: CSSProperties = {
  padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560,
}
const groupLabel: CSSProperties = { fontSize: 12, fontWeight: 600, color: '#2563eb', marginBottom: 2 }
const fieldRow: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4 }
const fieldLabel: CSSProperties = { fontSize: 13, fontWeight: 500 }
const fieldHint: CSSProperties = { fontSize: 11, opacity: 0.55 }
const input: CSSProperties = {
  padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.18)',
  fontSize: 14, background: '#fff', width: '100%',
}
const inlineRow: CSSProperties = { display: 'flex', gap: 14 }
const inlineCol: CSSProperties = { ...fieldRow, flex: 1 }
const footer: CSSProperties = { display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }
const saveBtn: CSSProperties = {
  padding: '8px 18px', borderRadius: 6, border: 'none', background: '#2563eb', color: '#fff',
  fontSize: 14, fontWeight: 500, cursor: 'pointer',
}
const statusText: CSSProperties = { fontSize: 13 }
const linkBtn: CSSProperties = {
  padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)',
  background: 'transparent', color: '#2563eb', fontSize: 12, cursor: 'pointer', alignSelf: 'flex-start',
}

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
  const [defaultPrompt, setDefaultPrompt] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    void api.getSettings().then((result) => {
      if (!alive) return
      setSettings(result.settings)
      setPresets(result.presets)
      setDefaultPrompt(result.defaultPrompt)
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

  const loadDefaultPrompt = useCallback(() => {
    if (defaultPrompt !== '') {
      setSettings(current => (current === null ? current : { ...current, prompt: defaultPrompt }))
    }
  }, [defaultPrompt])

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
    <li style={card}>
      <button
        type="button"
        style={headerBtn}
        aria-expanded={open}
        onClick={() => { setOpen(!open) }}
      >
        <span style={headerText}>
          <span style={title}>{t('nav')}</span>
          <span style={desc}>{t('desc')}</span>
        </span>
        <span style={chevron}>{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div style={body}>
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
              onChange={event => patch({ style: event.target.value as EmailSummarySettings['style'] })}
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
            <button type="button" style={linkBtn} onClick={loadDefaultPrompt}>
              {t('settings.loadDefaultPrompt')}
            </button>
          </FieldGroup>

          <div style={footer}>
            <button type="button" style={saveBtn} onClick={onSave} disabled={saving}>
              {saving ? t('settings.saving') : t('settings.save')}
            </button>
            {message !== null && <span style={statusText} role="status">{message}</span>}
          </div>
        </div>
      )}
    </li>
  )
}
