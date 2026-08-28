# 开发手册（Development）

## 仓库结构

```
packages/
  email-summary/        # Host 包
    src/
      index.ts          # EmailSummaryService：设置、凭证、SMTP、总结、自动发送、@Remote
      smtp.ts           # 零依赖 SMTP 客户端（node:net/tls，支持代理、465/587）
      summary.ts        # 转写 + LLM 总结 + Markdown→HTML + 邮件模板
      spec.ts           # 设置 schema + 邮箱预设
      types.ts          # 远程请求/结果类型
    lib/                # 构建产物（含生成的 typert remote）
  ui-email-summary/     # Client 包
    src/
      index.ts          # 槽位注册（插件配置卡片、发送按钮、自动发送开关）
      client/EmailSettingsSection.tsx   # 可折叠配置卡片
      client/EmailSendAction.tsx        # 图标+文字发送按钮
      client/AutosendToggle.tsx         # 自动发送开关
      client/locales.ts                 # zh/en 文案
    lib/                # 构建产物（lib/client.js 浏览器 bundle）
```

## 关键机制

- **远程调用**：Host 用 `@Remote(...)` 声明可调方法，typert 生成 `remote.emailSummary` 客户端；Client 通过 `ctx.remote.emailSummary` 调用。
- **设置**：Host 注册 `email-summary` 命名空间；Client 卡片读取/写入。
- **凭证**：密码经 `credentialRef('EMAIL_SMTP_PASSWORD')` 存储。
- **自动发送**：Host 监听 `agent/status`（idle），armed 会话触发总结+发送。
- **SMTP 代理**：`resolveProxy()` 读环境变量/系统代理，HTTP CONNECT 或 SOCKS5 隧道。

## 构建（需在 harness monorepo 内）

```sh
pnpm exec tsc -b packages/notification/email-summary            # host 类型检查
pnpm exec tsc -b packages/client/ui-email-summary               # client 类型检查
pnpm exec tsdown --env.DSH_BUILD_FACE host                      # 打包 host（含 typert 生成）
pnpm exec tsdown --env.DSH_BUILD_FACE client                    # 打包 client
```

构建完成后把 `lib/` 同步进本仓库并提交。

> 本仓库发布的是预构建 `lib/`，消费者无需构建。源码构建需要 harness 的 tsdown + typert 体系。

## 发布

```sh
git tag v0.1.0 && git push origin v0.1.0   # GitHub Actions 自动 npm publish
# 或本地
npm run publish:all                        # 先 host 后 client
```

需在仓库 `Settings → Secrets → Actions` 配置 `NPM_TOKEN`。

## 贡献

1. Fork 并基于 `main` 建分支。
2. 修改代码（在 harness 内构建后同步 `lib/`）。
3. 提交时遵循 Conventional Commits：`feat:` / `fix:` / `docs:` / `refactor:`。
4. 开 PR 说明改动与验证方式。

## License

MIT，见 [LICENSE](../LICENSE)。
