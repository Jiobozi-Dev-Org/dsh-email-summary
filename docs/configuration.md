# 配置参考（Configuration）

## 设置项（设置 → Plugins → 可配置 → 邮件通知）

| 字段 | 说明 | 说明文字 |
|---|---|---|
| 邮箱服务商 | gmail / qq / 163 / 126 / outlook / 自定义 | 选预设自动填主机/端口/加密 |
| SMTP 主机 | SMTP 服务器地址 | 例如 smtp.qq.com / smtp.163.com |
| 端口 | SMTP 端口 | 465（SSL）或 587（STARTTLS） |
| 加密方式 | starttls / ssl / none | SSL 走 465，STARTTLS 走 587 |
| 登录账号 | SMTP 登录账号 | 通常是完整邮箱地址 |
| 密码 / 授权码 | SMTP 密码或邮箱授权码 | 留空不修改；写入凭证 |
| 发件人邮箱 | From 地址 | 默认与登录账号相同 |
| 默认收件人 | 自动发送/未指定时使用 | 「结束后发送」用 |
| 总结详略 | detailed / brief | 详细更完整，简短更凝练 |
| 总结提示词 | 自定义 system prompt（可空） | 空则用所选详略的默认提示词；配置卡会预填默认，可直接查看/修改 |
| 定时发送 | 开关 | 开启后按频率定时汇总会话并发邮件 |
| 频率 | daily / weekly | 日报（每天）或 周报（每周） |
| 发送时间 | HH:MM | 24 小时制，如 09:00 |
| 周几 | 0-6 | 周报用；0=周日 … 6=周六 |

## 环境变量

| 环境变量 | 含义 | 备注 |
|---|---|---|
| `EMAIL_SMTP_PASSWORD` | SMTP 密码 / 授权码 | 凭证存储，设置页密码栏写入此处 |
| `HTTPS_PROXY` / `HTTP_PROXY` / `ALL_PROXY` | 出站代理 | 如 `http://127.0.0.1:12345` 或 `socks5://...` |

> 优先级：`HTTPS_PROXY` > `HTTPS_PROXY`(小写) > `HTTP_PROXY` > `ALL_PROXY` > Windows 系统代理。

## 邮箱预设速查

| 服务商 | 主机 | 端口 / 加密 | 密码 |
|---|---|---|---|
| Gmail | `smtp.gmail.com` | 587 / STARTTLS | 应用专用密码（需代理） |
| QQ 邮箱 | `smtp.qq.com` | 465 / SSL | 授权码 |
| 163 邮箱 | `smtp.163.com` | 465 / SSL | 授权码 |
| 126 邮箱 | `smtp.126.com` | 465 / SSL | 授权码 |
| Outlook / 365 | `smtp.office365.com` | 587 / STARTTLS | 应用密码 |

## 消息内容

- **标题格式**：`YY年M月D日 dsh开发笔记：<简短标题>`
- **正文**：HTML（内联样式），由 LLM 将对话总结为结构化 Markdown 后转换。
- **语言**：跟随对话原文语言（中文为主）。

## 凭证（Credential）

SMTP 密码通过 DSH 的凭证服务存储（键 `EMAIL_SMTP_PASSWORD`）。不在设置页面明文持久化，也不随远程响应返回。
