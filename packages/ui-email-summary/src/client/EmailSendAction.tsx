/**
 * One assistant-message "send email" action in the message IconActions row.
 * @module @deepseek-ai/dsh-client-ui-email-summary/client/EmailSendAction
 */

import { useCallback, useState } from 'react'
import type { InjectFace, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { EmailSendInjected } from './types.ts'

export type EmailSendActionProps =
  PropsLocale<'email'>
  & InjectFace<EmailSendInjected>

/**
 * A single button that summarizes the current conversation and emails it.
 * @param props - the injected `send` verb and the bound translator.
 */
export function EmailSendAction({ send, t }: EmailSendActionProps) {
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)

  const onClick = useCallback(() => {
    if (pending) return
    setPending(true)
    setFailure(null)
    void send().then((result) => {
      setPending(false)
      if (!result.ok) setFailure(result.error ?? t('send.failed'))
    })
  }, [pending, send, t])

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        title={t('send.title')}
        style={{ cursor: pending ? 'wait' : 'pointer' }}
      >
        {pending ? t('send.pending') : t('send.label')}
      </button>
      {failure !== null && (
        <span role="status" style={{ color: 'var(--dsh-color-danger, #c0392b)', fontSize: 12 }}>
          {failure}
        </span>
      )}
    </>
  )
}
