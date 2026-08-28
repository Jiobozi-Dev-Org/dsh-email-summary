/**
 * Email-summary surface plugin, browser half: a settings page, a per-message
 * "send email" action, and a composer auto-send toggle, all backed by the
 * generated `remote.emailSummary` Host Remote.
 * @module @deepseek-ai/dsh-client-ui-email-summary/client
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
/** Required services: the slot registry, the Remote namespace, and the copy. */
export declare const inject: string[];
/**
 * Client plugin body: registers the settings page, the send action, and the
 * composer toggle once their owning slots are on the ledger.
 * @param ctx - client root context.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map