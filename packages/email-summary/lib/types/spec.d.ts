/**
 * Durable settings namespace, schema, and provider presets for email-summary.
 * @module @deepseek-ai/dsh-email-summary/src/spec
 */
import z from '@deepseek-ai/schemastery';
import type { EmailProviderPreset, EmailSummarySettings } from './types.ts';
/** Durable settings namespace for SMTP + summary preferences. */
export declare const EMAIL_SUMMARY_SETTINGS_NAMESPACE = "email-summary";
/** Defaults applied when the namespace has not been written yet. */
export declare const DEFAULT_EMAIL_SETTINGS: EmailSummarySettings;
/** Settings schema (strings/numbers only; enums validated at read time). */
export declare const EmailSummarySettingsSchema: z<EmailSummarySettings>;
/** SMTP provider presets: Gmail / QQ / 163 / 126 / Outlook + custom. */
export declare const EMAIL_PROVIDER_PRESETS: readonly EmailProviderPreset[];
/** Look up one preset by id; `undefined` when unknown. */
export declare function presetById(id: string): EmailProviderPreset | undefined;
//# sourceMappingURL=spec.d.ts.map