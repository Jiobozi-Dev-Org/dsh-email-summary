/**
 * One assistant-message "send email" action in the message IconActions row.
 * Rendered as a circular icon button with a Tooltip, matching the shared
 * action chrome (copy / like / dislike).
 * @module @deepseek-ai/dsh-client-ui-email-summary/client/EmailSendAction
 */

import { useCallback, useState } from 'react'
import type { InjectFace, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { IconSendOutline16, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import type { EmailSendInjected } from './types.ts'
import css from './EmailSendAction.module.css'

export type EmailSendActionProps =
  PropsLocale<'email'>
  & InjectFace<EmailSendInjected>

/**
 * A single icon button that summarizes the current conversation and emails it.
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

  const label = pending ? t('send.pending') : t('send.label')

  return (
    <>
      <Tooltip label={label} side="bottom">
        <button
          type="button"
          className={css.action}
          aria-label={t('send.label')}
          disabled={pending}
          onClick={onClick}
        >
          <IconSendOutline16 />
        </button>
      </Tooltip>
      {failure !== null && <span className={css.failure} role="status">{failure}</span>}
    </>
  )
}
