/**
 * Host service: summarize a conversation and email it over SMTP, with a
 * durable settings namespace, a credential-backed password, per-session
 * auto-send arming, and a generated Client Remote (`remote.emailSummary`).
 * @module @deepseek-ai/dsh-email-summary
 */
import { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { ArmAutosendRequest, ArmAutosendResult, EmailProviderPreset, EmailStatusResult, EmailSummarySettings, SendEmailRequest, SendEmailResult } from './types.ts';
export type * from './types.ts';
export { EMAIL_PROVIDER_PRESETS, EMAIL_SUMMARY_SETTINGS_NAMESPACE, DEFAULT_EMAIL_SETTINGS } from './spec.ts';
declare module '@deepseek-ai/cordis' {
    interface Context {
        emailSummary: EmailSummaryService;
    }
}
/** Host service for conversation summarization + SMTP delivery. */
export declare class EmailSummaryService extends TypertRemoteService {
    static inject: string[];
    /** Session ids currently armed for auto-send, with an optional recipient override. */
    private readonly armed;
    /** The durable settings scope (structural type; matches `SettingsScope<T>`). */
    private readonly settingsScope;
    constructor(ctx: Context);
    /** Resolve effective mail configuration from settings + the credential password. */
    private resolveMail;
    /** Summarize one session and send it; throws on failure. */
    private summarizeAndSend;
    /** Summarize the current conversation and email it now. */
    sendNow(request: SendEmailRequest): Promise<SendEmailResult>;
    /** Arm or disarm auto-send for one conversation. */
    armAutosend(request: ArmAutosendRequest): ArmAutosendResult;
    /** Read configuration + armed state for the settings surface and toggles. */
    status(request: {
        sessionId: SessionId;
    }): Promise<EmailStatusResult>;
    /** Read the raw persisted settings (the surface edits these). */
    getSettings(): Promise<{
        settings: EmailSummarySettings;
        presets: EmailProviderPreset[];
        configured: boolean;
        defaultPrompt: string;
    }>;
    /** Persist a partial settings patch. */
    saveSettings(request: {
        patch: Partial<EmailSummarySettings>;
    }): Promise<{
        ok: boolean;
        error?: string;
    }>;
    /** Store (or clear) the SMTP password through the credential seam. */
    setPassword(request: {
        password: string;
    }): Promise<{
        ok: boolean;
        error?: string;
    }>;
}
export default EmailSummaryService;
//# sourceMappingURL=index.d.ts.map