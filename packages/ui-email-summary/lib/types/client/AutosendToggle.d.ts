/**
 * Composer auto-send toggle: arm/disarm "summarize + email at conversation end".
 * @module @deepseek-ai/dsh-client-ui-email-summary/client/AutosendToggle
 */
import type { InjectFace, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import type { AutosendInjected } from './types.ts';
export type AutosendToggleProps = PropsLocale<'email'> & InjectFace<AutosendInjected>;
/**
 * A checkbox in the composer tool row. When checked, the Host summarizes and
 * emails the conversation to the default recipient once the agent goes idle.
 * @param props - the injected Remote, session id, and bound translator.
 */
export declare function AutosendToggle({ api, sessionId, t }: AutosendToggleProps): import("react").JSX.Element;
//# sourceMappingURL=AutosendToggle.d.ts.map