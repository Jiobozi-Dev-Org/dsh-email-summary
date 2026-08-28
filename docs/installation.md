# 安装手册（Installation）

## 一、前置依赖

1. 一个可用的 **DeepSeek Harness（DSH）** 运行时。
2. 支持 SMTP 的邮箱账号（QQ / 163 / 126 需开启 SMTP 并生成**授权码**）。

## 二、安装包

npm：

```sh
npm install @jiobozi-dev-org/dsh-email-summary
npm install @jiobozi-dev-org/dsh-client-ui-email-summary
```

或使用 DSH 插件安装命令：

```sh
dsh plugin add @jiobozi-dev-org/dsh-email-summary
dsh plugin add @jiobozi-dev-org/dsh-client-ui-email-summary
```

> 两个包都要装——Host 承担发信逻辑，Client 提供界面。

## 三、组合配置（cordis.yml）

**host 组合**加一行：

```yaml
- id: email-summary
  name: '@jiobozi-dev-org/dsh-email-summary'
```

**client 组合**加一行：

```yaml
- id: ui-email-summary
  name: '@jiobozi-dev-org/dsh-client-ui-email-summary'
```

> 客户端 bundle 由 Host 的模块扫描通过 `dsh.client` 声明自动发现，无需手动列出。

## 四、验证

1. **重启 DSH**（Host + Client 都重载）。
2. 打开 **设置 → Plugins → 可配置**，应看到「邮件通知」卡片（默认折叠，点开是配置表单）。
3. 在某个助手消息的操作行，应看到「✈ 发送邮件」按钮。
4. 输入区应看到「结束后发送」开关。

三项都出现，即安装成功。

## 五、（可选）出站代理

如果你的网络无法直连 SMTP（例如国内访问 Gmail），插件会自动读系统代理或环境变量：

```powershell
# 用代理
$env:HTTPS_PROXY = "http://127.0.0.1:12345"   # 或 socks5://127.0.0.1:12345
```

不设环境变量时，Windows 会回退读取系统代理（Clash / V2Ray 的混合端口即可）。

## 六、发布（维护者）

打 tag 触发自动发布，或本地手动：

```sh
git tag v0.1.0 && git push origin v0.1.0   # CI 自动 npm publish
# 或本地
npm run publish:all
```

需在 GitHub 仓库配置 `NPM_TOKEN` secret。
