/**
 * Durable settings namespace, schema, and provider presets for email-summary.
 * @module @deepseek-ai/dsh-email-summary/src/spec
 */
import z from '@deepseek-ai/schemastery';
/** Durable settings namespace for SMTP + summary preferences. */
export const EMAIL_SUMMARY_SETTINGS_NAMESPACE = 'email-summary';
/** Defaults applied when the namespace has not been written yet. */
export const DEFAULT_EMAIL_SETTINGS = {
    provider: 'qq',
    smtpHost: 'smtp.qq.com',
    smtpPort: 465,
    secure: 'ssl',
    username: '',
    from: '',
    defaultRecipient: '',
    style: 'detailed',
    prompt: '',
    reportEnabled: false,
    reportFrequency: 'daily',
    reportTime: '09:00',
    reportWeekday: 1,
    reportWindow: 'calendar',
};
/** Settings schema (strings/numbers only; enums validated at read time). */
export const EmailSummarySettingsSchema = z.object({
    provider: z.string(),
    smtpHost: z.string(),
    smtpPort: z.number(),
    secure: z.string(),
    username: z.string(),
    from: z.string(),
    defaultRecipient: z.string(),
    style: z.string(),
    prompt: z.string(),
    reportEnabled: z.boolean(),
    reportFrequency: z.string(),
    reportTime: z.string(),
    reportWeekday: z.number(),
    reportWindow: z.string(),
});
/** SMTP provider presets: Gmail / QQ / 163 / 126 / Outlook + custom. */
export const EMAIL_PROVIDER_PRESETS = Object.freeze([
    Object.freeze({ id: 'gmail', label: 'Gmail', host: 'smtp.gmail.com', port: 587, secure: 'starttls' }),
    Object.freeze({ id: 'qq', label: 'QQ 邮箱', host: 'smtp.qq.com', port: 465, secure: 'ssl' }),
    Object.freeze({ id: '163', label: '163 邮箱', host: 'smtp.163.com', port: 465, secure: 'ssl' }),
    Object.freeze({ id: '126', label: '126 邮箱', host: 'smtp.126.com', port: 465, secure: 'ssl' }),
    Object.freeze({ id: 'outlook', label: 'Outlook / 365', host: 'smtp.office365.com', port: 587, secure: 'starttls' }),
    Object.freeze({ id: 'custom', label: '自定义', host: '', port: 587, secure: 'starttls' }),
]);
/** Look up one preset by id; `undefined` when unknown. */
export function presetById(id) {
    return EMAIL_PROVIDER_PRESETS.find(preset => preset.id === id);
}
//# sourceMappingURL=spec.js.map