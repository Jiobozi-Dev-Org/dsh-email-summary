# dsh-email-summary

一个 **DeepSeek Harness（DSH）插件**：把当前对话总结成一份**排版精美的 HTML 邮件**，通过 SMTP 发送到指定邮箱。标题自动带日期前缀，例如：

> `26年8月26日 dsh开发笔记：Web 插件打包方案总结`

> English docs: [README.md](./README.md) · 完整文档见 [docs/](./docs/README.md)

## ✨ 功能

- **带样式的 HTML 正文**：蓝色渐变标题栏 + 白底正文卡片，分节标题、列表、加粗、行内代码等样式（全部内联 CSS，兼容邮件客户端），不再是 Markdown 纯文本。
- **标题自动生成**：`日期 + dsh开发笔记：` 前缀，后面是 LLM 从对话里提炼的简短标题。
- **常用邮箱预设**：Gmail / QQ / 163 / 126 / Outlook / 自定义，选预设自动填好主机、端口、加密方式。
- **两种发送方式**：
  - 助手消息上的「**发送邮件**」按钮，一键总结并发送当前会话；
  - 输入区的「**结束后发送**」开关，对话结束（agent 转 idle）时自动总结并发送到默认收件人。
- **密码走凭证**：SMTP 密码存到凭证存储（环境变量 `EMAIL_SMTP_PASSWORD`），不落明文进设置。
- **代理支持**：自动读取 `HTTPS_PROXY`/`HTTP_PROXY`/`ALL_PROXY` 环境变量或 Windows 系统代理，支持 HTTP CONNECT 与 SOCKS5 隧道（可访问被墙的 SMTP）。
- **零依赖 SMTP 客户端**：`node:net`/`node:tls` 实现，支持 465 隐式 SSL / 587 STARTTLS / 25 无加密，AUTH PLAIN，UTF-8 正文。

## 📦 安装

本插件包含两个包（Host + Client），都发布在 npm：

```sh
npm install @jiobozi-dev-org/dsh-email-summary
npm install @jiobozi-dev-org/dsh-client-ui-email-summary
```

若使用 DSH 的插件安装命令：

```sh
dsh plugin add @jiobozi-dev-org/dsh-email-summary
dsh plugin add @jiobozi-dev-org/dsh-client-ui-email-summary
```

## 🔧 组合（cordis.yml）

在部署的 host 组合里加入 host 行，在 client 组合里加入 client 行：

```yaml
# host 组合
- id: email-summary
  name: '@jiobozi-dev-org/dsh-email-summary'

# client 组合
- id: ui-email-summary
  name: '@jiobozi-dev-org/dsh-client-ui-email-summary'
```

（`dsh.client` 声明已在 client 包的 `package.json` 里，host 的模块扫描会自动发现客户端 bundle。）

## ⚙️ 配置

1. 打开 **设置 → Plugins → 可配置**，找到「邮件通知」卡片，选择邮箱预设（Gmail / QQ / 163 / 126 / Outlook / 自定义）。
2. 填写：登录账号、发件人邮箱、默认收件人、总结详略。
3. 密码/授权码填在「密码」栏，保存后会写入凭证（`EMAIL_SMTP_PASSWORD`）。

也可以直接用环境变量提供配置：

| 环境变量 | 含义 |
|---|---|
| `EMAIL_SMTP_PASSWORD` | SMTP 密码 / 授权码（凭证） |
| `HTTPS_PROXY` / `HTTP_PROXY` / `ALL_PROXY` | 出站代理（如 `http://127.0.0.1:12345` 或 `socks5://...`） |

## 📮 邮箱预设

| 服务商 | 主机 | 端口 / 加密 |
|---|---|---|
| Gmail | `smtp.gmail.com` | 587 / STARTTLS |
| QQ 邮箱 | `smtp.qq.com` | 465 / SSL |
| 163 邮箱 | `smtp.163.com` | 465 / SSL |
| 126 邮箱 | `smtp.126.com` | 465 / SSL |
| Outlook / 365 | `smtp.office365.com` | 587 / STARTTLS |

> 注意：QQ / 163 / 126 需要在邮箱设置里开启 SMTP 并生成「授权码」，用授权码而不是登录密码。

## 📁 仓库结构

```
packages/
  email-summary/        # Host 包：设置、凭证、SMTP、总结、自动发送、@Remote
    src/                # 源码
    lib/                # 构建产物（含生成的 typert remote）
  ui-email-summary/     # Client 包：设置页、发送按钮、自动发送开关
    src/
    lib/                # 构建产物（lib/client.js 浏览器 bundle）
.github/workflows/publish.yml   # 打 tag 自动发布
```

## 🔨 构建（维护者）

本仓库发布的是**已构建产物**（`lib/`），消费者无需重新构建。源码构建依赖 DeepSeek Harness 的 monorepo 构建体系（tsdown + typert 代码生成），请在 harness 仓库内完成后把 `lib/` 一并提交。

## 🚀 发布

1. 在 GitHub 仓库 Settings → Secrets → Actions 里添加 `NPM_TOKEN`（npm access token）。
2. 打 tag 触发自动发布：

```sh
git tag v0.1.0
git push origin v0.1.0
```

或本地手动：

```sh
npm run publish:all
```

## ⚠️ 前置依赖

本插件 `peerDependencies` 依赖 DeepSeek Harness 的运行时包（`@deepseek-ai/cordis`、`@deepseek-ai/dsh-llm`、`@deepseek-ai/dsh-session` 等），消费者需先有可用的 DSH 运行时环境。

## License

[MIT](./LICENSE)
