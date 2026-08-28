/**
 * One assistant-message "send email" action in the message IconActions row.
 * Rendered as a pill button with an icon + label, using the shared theme
 * tokens so it sits consistently beside the copy / like / dislike icons.
 * @module @deepseek-ai/dsh-client-ui-email-summary/client/EmailSendAction
 */

import { useCallback, useState } from 'react'
import type { InjectFace, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { IconSendOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { EmailSendInjected } from './types.ts'
import css from './EmailSendAction.module.css'

export type EmailSendActionProps =
  PropsLocale<'email'>
  & InjectFace<EmailSendInjected>

/**
 * A pill button that summarizes the current conversation and emails it.
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
        className={css.actionPill}
        disabled={pending}
        title={t('send.title')}
        onClick={onClick}
      >
        <IconSendOutline16 size={14} />
        <span>{pending ? t('send.pending') : t('send.label')}</span>
      </button>
      {failure !== null && <span className={css.failure} role="status">{failure}</span>}
    </>
  )
}
