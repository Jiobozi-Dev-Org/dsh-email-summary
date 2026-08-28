/** `email` namespace dictionaries. */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'nav': '邮件通知',
  'send.label': '发送邮件',
  'send.title': '把当前对话总结成 Markdown 并通过邮件发送',
  'send.pending': '发送中…',
  'send.done': '已发送',
  'send.failed': '发送失败',
  'toggle.label': '结束后发送',
  'toggle.title': '本次对话结束后自动总结并发送到默认收件人',
  'settings.provider': '邮箱服务商',
  'settings.host': 'SMTP 主机',
  'settings.port': '端口',
  'settings.secure': '加密方式',
  'settings.username': '登录账号',
  'settings.password': '密码 / 授权码',
  'settings.passwordHint': '留空则不修改；通过环境变量 EMAIL_SMTP_PASSWORD 安全存储',
  'settings.from': '发件人邮箱',
  'settings.recipient': '默认收件人',
  'settings.style': '总结详略',
  'settings.detailed': '详细',
  'settings.brief': '简短',
  'settings.save': '保存',
  'settings.saving': '保存中…',
  'settings.saved': '已保存',
  'settings.error': '保存失败',
} satisfies Record<string, string>

/** The email namespace key union. */
export type EmailKey = keyof typeof zh

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The email-summary surface copy. */
    email: EmailKey
  }
}

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'nav': 'Email',
  'send.label': 'Send email',
  'send.title': 'Summarize this conversation as Markdown and email it',
  'send.pending': 'Sending…',
  'send.done': 'Sent',
  'send.failed': 'Send failed',
  'toggle.label': 'Send when done',
  'toggle.title': 'Automatically summarize and email this conversation to the default recipient when it ends',
  'settings.provider': 'Provider',
  'settings.host': 'SMTP host',
  'settings.port': 'Port',
  'settings.secure': 'Security',
  'settings.username': 'Username',
  'settings.password': 'Password / app password',
  'settings.passwordHint': 'Leave blank to keep unchanged; stored via the EMAIL_SMTP_PASSWORD environment variable',
  'settings.from': 'From address',
  'settings.recipient': 'Default recipient',
  'settings.style': 'Summary detail',
  'settings.detailed': 'Detailed',
  'settings.brief': 'Brief',
  'settings.save': 'Save',
  'settings.saving': 'Saving…',
  'settings.saved': 'Saved',
  'settings.error': 'Save failed',
} satisfies Record<EmailKey, string>
