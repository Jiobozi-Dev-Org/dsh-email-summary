/**
 * Email-summary plugin configuration card (shown in Settings → Plugins).
 * Collapsed by default, mirroring the shared PluginCard chrome so it sits
 * beside the built-in shell / agent-loop / web-search cards identically.
 * @module @jiobozi-dev-org/dsh-client-ui-email-summary/client/EmailSettingsSection
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