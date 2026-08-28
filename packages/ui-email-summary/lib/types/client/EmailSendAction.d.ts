/**
 * One assistant-message "send email" action in the message IconActions row.
 * @module @deepseek-ai/dsh-client-ui-email-summary/client/EmailSendAction
 */
import type { InjectFace, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import type { EmailSendInjected } from './types.ts';
export type EmailSendActionProps = PropsLocale<'email'> & InjectFace<EmailSendInjected>;
/**
 * A single button that summarizes the current conversation and emails it.
 * @param props - the injected `send` verb and the bound translator.
 */
export declare function EmailSendAction({ send, t }: EmailSendActionProps): import("react").JSX.Element;
//# sourceMappingURL=EmailSendAction.d.ts.map