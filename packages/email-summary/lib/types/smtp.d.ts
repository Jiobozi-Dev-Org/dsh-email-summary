/**
 * Minimal, dependency-free SMTP client over `node:net`/`node:tls`.
 * Supports implicit SSL (465), STARTTLS (587), and no-TLS (25), with
 * AUTH PLAIN authentication and UTF-8 (base64) message bodies. Outbound
 * connections honor an HTTP/SOCKS5 proxy from `HTTPS_PROXY`/`HTTP_PROXY`/
 * `ALL_PROXY` environment variables, falling back to the Windows system
 * proxy, so a local Clash/V2Ray tunnel can reach blocked SMTP hosts.
 * @module @deepseek-ai/dsh-email-summary/src/smtp
 */
/** One outbound email. */
export interface SmtpMail {
    host: string;
    port: number;
    secure: 'starttls' | 'ssl' | 'none';
    username: string;
    password: string;
    from: string;
    to: string;
    subject: string;
    html: string;
}
/** Send one email over SMTP. */
export declare function sendSmtpMail(mail: SmtpMail): Promise<void>;
//# sourceMappingURL=smtp.d.ts.map