# 故障排查（Troubleshooting）

## 1. `SMTP socket error: connect ETIMEDOUT ...`

- **原因**：连不上 SMTP 服务器（常因国内直连 Gmail 被墙、或端口被防火墙拦截）。
- **解决**：
  - 换国内邮箱（QQ / 163 / 126，端口 465 SSL）。
  - 或配代理：`$env:HTTPS_PROXY="http://127.0.0.1:12345"`（Clash/V2Ray 混合端口）。
  - 确认端口：465（SSL）与 587（STARTTLS）别混用。

## 2. `SMTP socket error: 连接 smtp...:587 超时（20s）...`

- 和上面同因；插件加了 20s 连接超时，失败更快。检查网络/代理。

## 3. 发送被 535 / Authentication failed 拒绝

- **原因**：账号密码不对，或用了**登录密码**而不是**授权码**。
- **解决**：QQ/163/126 到邮箱设置开启 SMTP，生成**授权码**填入（不是登录密码）。
- Gmail：用「应用专用密码」，且需代理。

## 4. 卡在 AUTH / 发不出去

- 检查「登录账号」是否为完整邮箱；检查授权码是否已开启 SMTP 服务。
- 端口/加密与预设一致：选预设会自动填。

## 5. 页面看不到「邮件通知」卡片

- 确认 host 组合加了 `@jiobozi-dev-org/dsh-email-summary`，client 组合加了 `@jiobozi-dev-org/dsh-client-ui-email-summary`。
- **重启 DSH** 后刷新页面。
- 确认 `ui-settings-plugins` 在 client 组合中（卡片挂在 Plugins 分区）。

## 6. 看不到「✈ 发送邮件」按钮 / 「结束后发送」开关

- 确认 client 包已安装并重启。
- 按钮在**每一条助手消息**的操作行；开关在输入区右侧。

## 7. 邮件正文是纯文本/Markdown（没有样式）

- 确认使用的是本插件（Host 包），并将 `Content-Type` 设为 `text/html`（默认）。
- 旧版（临时插件）可能是纯文本；重新安装新版 Host 包。

## 8. 运行时依赖缺失

- 报错提到 `@deepseek-ai/dsh-llm`、`@deepseek-ai/cordis` 等 peerDependency 无法解析。
- 需确保 DSH 运行时环境已安装这些包（它们是 harness 自带的运行时依赖）。
- Host 半部注入的服务需要：`dsh-llm`、`dsh-session-query`、`dsh-settings`、`dsh-credentials`、`dsh-agent-default-model`、`cordis-plugin-timer`，并监听 `@deepseek-ai/dsh-agent` 的 `agent/status` 事件。

## 9. 自动发送没触发

- 「结束后发送」是会话级、内存中的；DSH 重启会丢失 armed 状态。
- 确认 agent 确实转为 idle（对话结束），且已配置默认收件人。

## 10. build 报错（维护者）

- 源码构建依赖 DeepSeek Harness monorepo（tsdown + typert 代码生成）。
- 本仓库发布的是预构建 `lib/`，消费者无需构建。

## 11. Client 半部一直不激活（`remote.emailSummary` 缺失）

- Client 半部通过 `remote.emailSummary` 这个 Typert Remote 与 Host 通信；该命名空间需要由宿主 harness 的 Remote 装配（`api-remotes`）挂载。
- 参考实现里，DeepSeek Harness monorepo 的 `api-remotes` 已把 `@deepseek-ai/dsh-email-summary/remote` 纳入装配。若你在自己的 harness 上安装本插件而 Client 不激活，请确认该装配已包含 email-summary，或让 Client 自行 `$mount` 本包的 `/remote` 贡献。
