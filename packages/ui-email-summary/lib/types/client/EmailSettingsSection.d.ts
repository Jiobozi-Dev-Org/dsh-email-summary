/**
 * Email-summary plugin configuration card (shown in Settings → Plugins).
 * Collapsed by default, like the built-in plugin cards; expanding reveals the
 * SMTP + summary form, whose fields are persisted through the Host Remote.
 * @module @deepseek-ai/dsh-client-ui-email-summary/client/EmailSettingsSection
 */
import type { InjectFace } from '@deepseek-ai/dsh-client-ui-slots';
import type { EmailSettingsInjected } from './types.ts';
export type EmailSettingsSectionProps = InjectFace<EmailSettingsInjected>;
/**
 * The collapsible configuration card.
 * @param props - the injected Remote and bound translator.
 */
export declare function EmailSettingsSection({ api, t }: EmailSettingsSectionProps): import("react").JSX.Element | null;
//# sourceMappingURL=EmailSettingsSection.d.ts.map