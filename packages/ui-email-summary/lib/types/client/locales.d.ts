/** `email` namespace dictionaries. */
/** Simplified Chinese dictionary (the key-set source of truth). */
export declare const zh: {
    nav: string;
    'send.label': string;
    'send.title': string;
    'send.pending': string;
    'send.done': string;
    'send.failed': string;
    'toggle.label': string;
    'toggle.title': string;
    'settings.provider': string;
    'settings.host': string;
    'settings.port': string;
    'settings.secure': string;
    'settings.username': string;
    'settings.password': string;
    'settings.passwordHint': string;
    'settings.from': string;
    'settings.recipient': string;
    'settings.style': string;
    'settings.detailed': string;
    'settings.brief': string;
    'settings.save': string;
    'settings.saving': string;
    'settings.saved': string;
    'settings.error': string;
};
/** The email namespace key union. */
export type EmailKey = keyof typeof zh;
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** The email-summary surface copy. */
        email: EmailKey;
    }
}
/** English dictionary, checked complete against the zh key set. */
export declare const en: {
    nav: string;
    'send.label': string;
    'send.title': string;
    'send.pending': string;
    'send.done': string;
    'send.failed': string;
    'toggle.label': string;
    'toggle.title': string;
    'settings.provider': string;
    'settings.host': string;
    'settings.port': string;
    'settings.secure': string;
    'settings.username': string;
    'settings.password': string;
    'settings.passwordHint': string;
    'settings.from': string;
    'settings.recipient': string;
    'settings.style': string;
    'settings.detailed': string;
    'settings.brief': string;
    'settings.save': string;
    'settings.saving': string;
    'settings.saved': string;
    'settings.error': string;
};
//# sourceMappingURL=locales.d.ts.map