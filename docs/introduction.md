# 介绍（Introduction）

**dsh-email-summary** 是一个 [DeepSeek Harness（DSH）](https://github.com/deepseek-ai/deepseek-harness) 插件，把**当前对话总结成一份排版精美的 HTML 邮件**，并通过 SMTP 发送到你指定的邮箱。

## 它能做什么

- **一键发送**：点助手消息上的「✈ 发送邮件」，自动总结当前对话并发信。
- **对话结束自动发送**：输入区打开「结束后发送」，agent 空闲时自动总结并发送到默认收件人。
- **带样式的 HTML 正文**：蓝色渐变标题栏 + 白底卡片，分段标题、列表、加粗、行内代码，全部内联 CSS，兼容邮件客户端。
- **日期前缀标题**：`26年8月26日 dsh开发笔记：简短总结`，标题由 LLM 从对话里提炼。
- **常见邮箱预设**：Gmail / QQ / 163 / 126 / Outlook / 自定义，选预设自动填主机/端口/加密。
- **代理支持**：自动读环境变量或 Windows 系统代理，走 HTTP CONNECT / SOCKS5，可访问被墙的 SMTP。
- **凭证存储密码**：SMTP 密码存进凭证（`EMAIL_SMTP_PASSWORD`），不落明文。

## 工作原理

```
对话结束后 / 点发送
      │
      ▼
Host：读取该会话的对话记录（sessionQuery）
      │
      ▼
Host：调用 LLM 生成「简短标题 + 结构化 Markdown」
      │
      ▼
Host：Markdown → 带内联样式的 HTML，套邮件模板
      │
      ▼
Host：拼接日期前缀标题 + 通过 SMTP 发送（支持代理）
      │
      ▼
收件人收到排版好的 HTML 邮件
```

## 架构

插件由两个 npm 包组成：

| 包 | 职责 |
|---|---|
| `@jiobozi-dev-org/dsh-email-summary`（Host） | 设置命名空间注册、凭证、LLM 总结、SMTP 发送、自动发送监听、`@Remote` 远程方法 |
| `@jiobozi-dev-org/dsh-client-ui-email-summary`（Client） | 插件配置卡片、助手消息发送按钮、输入区自动发送开关，浏览器 UI |

两者通过生成的 `remote.emailSummary` 远程接口通信；Host 的模块扫描通过 `dsh.client` 声明自动发现客户端 bundle。

## 依赖前提

插件 `peerDependencies` 依赖 DeepSeek Harness 运行时包（`@deepseek-ai/cordis`、`@deepseek-ai/dsh-llm`、`@deepseek-ai/dsh-session` 等）。使用前需有可用的 DSH 运行时环境。
