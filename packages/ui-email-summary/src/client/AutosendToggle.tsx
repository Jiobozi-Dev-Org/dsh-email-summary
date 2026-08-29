/**
 * Composer auto-send toggle: arm/disarm "summarize + email at conversation end".
 * @module @jiobozi-dev-org/dsh-client-ui-email-summary/client/AutosendToggle
 */

import { useCallback, useEffect, useState } from 'react'
import type { InjectFace, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { AutosendInjected } from './types.ts'

export type AutosendToggleProps =
  PropsLocale<'email'>
  & InjectFace<AutosendInjected>

/**
 * A checkbox in the composer tool row. When checked, the Host summarizes and
 * emails the conversation to the default recipient once the agent goes idle.
 * @param props - the injected Remote, session id, and bound translator.
 */
export function AutosendToggle({ api, sessionId, t }: AutosendToggleProps) {
  const [armed, setArmed] = useState(false)
  const [configured, setConfigured] = useState(false)

  useEffect(() => {
    let alive = true
    void api.status({ sessionId }).then((status) => {
      if (!alive) return
      setArmed(status.armed)
      setConfigured(status.configured)
    })
    return () => { alive = false }
  }, [api, sessionId])

  const onChange = useCallback(() => {
    const next = !armed
    setArmed(next)
    void api.armAutosend({ sessionId, enabled: next })
  }, [armed, api, sessionId])

  return (
    <label title={t('toggle.title')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <input
        type="checkbox"
        checked={armed}
        onChange={onChange}
        disabled={!configured}
      />
      <span style={{ fontSize: 12 }}>{t('toggle.label')}</span>
    </label>
  )
}
