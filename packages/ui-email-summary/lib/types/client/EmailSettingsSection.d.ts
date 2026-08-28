/**
 * Email-summary settings page: provider preset, SMTP fields, password, and
 * summary preference, persisted through the `remote.emailSummary` Host Remote.
 * @module @deepseek-ai/dsh-client-ui-email-summary/client/EmailSettingsSection
 */
import type { InjectFace } from '@deepseek-ai/dsh-client-ui-slots';
import type { EmailSettingsInjected } from './types.ts';
export type EmailSettingsSectionProps = InjectFace<EmailSettingsInjected>;
/**
 * A plain form: the provider select fills host/port/security from the preset;
 * Save writes settings and (when entered) the credential-backed password.
 * @param props - the injected Remote and bound translator.
 */
export declare function EmailSettingsSection({ api, t }: EmailSettingsSectionProps): import("react").JSX.Element | null;
//# sourceMappingURL=EmailSettingsSection.d.ts.map