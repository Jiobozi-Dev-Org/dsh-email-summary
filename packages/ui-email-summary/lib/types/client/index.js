/**
 * Email-summary surface plugin, browser half: a settings page, a per-message
 * "send email" action, and a composer auto-send toggle, all backed by the
 * generated `remote.emailSummary` Host Remote.
 * @module @jiobozi-dev-org/dsh-client-ui-email-summary/client
 */
import { EmailSendAction } from "./EmailSendAction.js";
import { AutosendToggle } from "./AutosendToggle.js";
import { EmailSettingsSection } from "./EmailSettingsSection.js";
import { en, zh } from "./locales.js";
/** Dictionary namespace owned by this plugin. */
const NS = 'email';
/** Required services: the slot registry, the Remote namespace, and the copy. */
export const inject = ['slots', 'locale', 'remote', 'remote.emailSummary'];
/** Read a Remote failure as a human-readable string. */
function errorText(failure) {
    if (failure == null)
        return '远程调用失败';
    if (typeof failure === 'string')
        return failure;
    const record = failure;
    return typeof record.message === 'string' ? record.message : '远程调用失败';
}
/**
 * Client plugin body: registers the settings page, the send action, and the
 * composer toggle once their owning slots are on the ledger.
 * @param ctx - client root context.
 */
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-email-summary: dictionaries');
    const remote = ctx.remote.emailSummary;
    const t = ctx.locale.bind(NS);
    // Fold the carrier's RemoteResult wrapper away so components read plain data.
    // Every method also folds a transport-level rejection (a thrown Host handler or
    // a dropped connection) into a plain fallback, so call sites' `.then` always
    // runs and in-flight UI state can never be left stuck.
    const api = {
        sendNow: request => remote.sendNow(request).then(result => result.ok
            ? result.value
            : {
                ok: false,
                recipient: request.recipient ?? '',
                subject: request.subject ?? '',
                summaryChars: 0,
                transcriptChars: 0,
                error: errorText(result.error),
            }).catch((error) => ({
            ok: false,
            recipient: request.recipient ?? '',
            subject: request.subject ?? '',
            summaryChars: 0,
            transcriptChars: 0,
            error: errorText(error),
        })),
        armAutosend: request => remote.armAutosend(request).then(result => result.ok ? result.value : { ok: false, armed: false })
            .catch(() => ({ ok: false, armed: false })),
        status: request => remote.status(request).then(result => result.ok ? result.value : { configured: false, defaultRecipient: '', armed: false, presets: [] })
            .catch(() => ({ configured: false, defaultRecipient: '', armed: false, presets: [] })),
        getSettings: () => remote.getSettings().then((result) => {
            if (result.ok)
                return result.value;
            throw new Error(errorText(result.error));
        }).catch((error) => {
            throw error instanceof Error ? error : new Error(errorText(error));
        }),
        saveSettings: request => remote.saveSettings(request).then(result => result.ok ? result.value : { ok: false, error: errorText(result.error) })
            .catch((error) => ({ ok: false, error: errorText(error) })),
        setPassword: request => remote.setPassword(request).then(result => result.ok ? result.value : { ok: false, error: errorText(result.error) })
            .catch((error) => ({ ok: false, error: errorText(error) })),
        reportStatus: () => remote.reportStatus().then(result => result.ok ? result.value : { enabled: false, frequency: 'daily', time: '09:00', weekday: 1 })
            .catch(() => ({ enabled: false, frequency: 'daily', time: '09:00', weekday: 1 })),
        reportNow: () => remote.reportNow().then(result => result.ok
            ? result.value
            : { ok: false, sent: false, count: 0, subject: '', error: errorText(result.error) })
            .catch((error) => ({ ok: false, sent: false, count: 0, subject: '', error: errorText(error) })),
    };
    ctx.slots.inject('settings.plugin.item', () => {
        const dispose = ctx.slots.register({
            name: 'settings.plugin.item',
            key: 'email-summary',
            locale: NS,
            inject: () => ({ api, t }),
        }, EmailSettingsSection);
        return () => dispose();
    });
    ctx.slots.inject('conversation.chat.assistant-actions', () => {
        const dispose = ctx.slots.register({
            name: 'conversation.chat.assistant-actions',
            id: 'email-summary',
            order: 20,
            locale: NS,
            inject: (sessionId) => ({
                t,
                send: () => api.sendNow({ sessionId }),
            }),
        }, EmailSendAction);
        return () => dispose();
    });
    ctx.slots.inject('conversation.input.right', () => {
        const dispose = ctx.slots.register({
            name: 'conversation.input.right',
            id: 'email-summary',
            order: 0,
            locale: NS,
            inject: (sessionId) => ({ api, t, sessionId }),
        }, AutosendToggle);
        return () => dispose();
    });
}
//# sourceMappingURL=index.js.map