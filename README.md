# dsh-email-summary

A **DeepSeek Harness (DSH) plugin** that summarizes the current conversation into a beautifully styled **HTML email** and sends it over SMTP. The subject is automatically prefixed with the date, for example:

> `26年8月26日 dsh开发笔记：Web plugin packaging summary`

> 中文文档见 [README.zh-CN.md](./README.zh-CN.md) · 完整文档见 [docs/](./docs/README.md)

## ✨ Features

- **Styled HTML body**: gradient title bar + white content card, with section headings, lists, bold, and inline-code styling (all inline CSS, email-client friendly) — no more plain Markdown.
- **Auto-generated subject**: `date + dsh开发笔记：` prefix, followed by a short title the LLM extracts from the conversation.
- **Provider presets**: Gmail / QQ / 163 / 126 / Outlook / Custom. Selecting a preset fills host, port, and encryption automatically.
- **Two send modes**:
  - a **"Send email"** button on assistant messages — one click summarizes and sends the current conversation;
  - an **"Send when done"** toggle in the composer — automatically summarizes and sends to the default recipient when the conversation ends (agent goes idle).
- **Credential-backed password**: the SMTP password is stored as a credential (`EMAIL_SMTP_PASSWORD` env var), never in plaintext settings.
- **Proxy support**: reads `HTTPS_PROXY` / `HTTP_PROXY` / `ALL_PROXY` env vars or the Windows system proxy; supports HTTP `CONNECT` and SOCKS5 tunnels (for reaching blocked SMTP hosts).
- **Dependency-free SMTP client**: implemented on `node:net` / `node:tls`; supports 465 implicit SSL / 587 STARTTLS / 25 plain, AUTH PLAIN, UTF-8 bodies.

## 📦 Installation

This plugin ships as two packages (Host + Client), both published to npm:

```sh
npm install @jiobozi-dev-org/dsh-email-summary
npm install @jiobozi-dev-org/dsh-client-ui-email-summary
```

Or with the DSH plugin installer:

```sh
dsh plugin add @jiobozi-dev-org/dsh-email-summary
dsh plugin add @jiobozi-dev-org/dsh-client-ui-email-summary
```

## 🔧 Composition (cordis.yml)

Add the Host row to the host composition and the Client row to the client composition:

```yaml
# host composition
- id: email-summary
  name: '@jiobozi-dev-org/dsh-email-summary'

# client composition
- id: ui-email-summary
  name: '@jiobozi-dev-org/dsh-client-ui-email-summary'
```

(The `dsh.client` declaration in the client package's `package.json` lets the Host's module scan discover the browser bundle automatically.)

## ⚙️ Configuration

1. Open **Settings → Plugins → Configurable**, find the **Email** card, and pick a provider preset (Gmail / QQ / 163 / 126 / Outlook / Custom).
2. Fill in: login username, sender address, default recipient, summary detail level.
3. Enter the password / authorization code in the password field; saving stores it as a credential (`EMAIL_SMTP_PASSWORD`).

You can also provide SMTP configuration through environment variables:

| Environment variable | Meaning |
|---|---|
| `EMAIL_SMTP_PASSWORD` | SMTP password / authorization code (credential) |
| `HTTPS_PROXY` / `HTTP_PROXY` / `ALL_PROXY` | outbound proxy, e.g. `http://127.0.0.1:12345` or `socks5://...` |

## 📮 Provider presets

| Provider | Host | Port / encryption |
|---|---|---|
| Gmail | `smtp.gmail.com` | 587 / STARTTLS |
| QQ Mail | `smtp.qq.com` | 465 / SSL |
| 163 Mail | `smtp.163.com` | 465 / SSL |
| 126 Mail | `smtp.126.com` | 465 / SSL |
| Outlook / 365 | `smtp.office365.com` | 587 / STARTTLS |

> Note: QQ / 163 / 126 require enabling SMTP in the mailbox settings and generating an **authorization code**; use the code, not your login password.

## 📁 Repository layout

```
packages/
  email-summary/        # Host package: settings, credentials, SMTP, summary, auto-send, @Remote
    src/                # source
    lib/                # built artifacts (including the generated typert remote)
  ui-email-summary/     # Client package: settings page, send button, auto-send toggle
    src/
    lib/                # built artifacts (lib/client.js browser bundle)
.github/workflows/publish.yml   # auto-publish on tag
```

## 🔨 Building (maintainers)

This repository publishes **pre-built artifacts** (`lib/`); consumers do not need to rebuild. Building the source requires the DeepSeek Harness monorepo build system (tsdown + typert code generation) — build there, then commit the resulting `lib/`.

## 🚀 Publishing

1. Add `NPM_TOKEN` (an npm access token) under GitHub repo `Settings → Secrets and variables → Actions`.
2. Tag and push to trigger the release:

```sh
git tag v0.1.0
git push origin v0.1.0
```

Or locally:

```sh
npm run publish:all
```

## ⚠️ Prerequisites

This plugin peer-depends on the DeepSeek Harness runtime packages (`@deepseek-ai/cordis`, `@deepseek-ai/dsh-llm`, `@deepseek-ai/dsh-session`, …). Consumers need a working DSH runtime.

## License

[MIT](./LICENSE)
