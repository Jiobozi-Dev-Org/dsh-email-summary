# 文档

本插件 **dsh-email-summary** 的完整文档。

> 项目概览 / **English**：见 [README.md](../README.md)（英文）与 [README.zh-CN.md](../README.zh-CN.md)（中文）。

## 目录

| 文档 | 内容 |
|---|---|
| [介绍 introduction](./introduction.md) | 项目定位、功能、工作原理、架构 |
| [安装手册 installation](./installation.md) | 依赖、安装、组合配置、验证 |
| [使用手册 usage](./usage.md) | 配置、发送按钮、自动发送、代理、实际场景 |
| [配置参考 configuration](./configuration.md) | 设置项、环境变量、预设速查表 |
| [故障排查 troubleshooting](./troubleshooting.md) | 常见报错与解决 |
| [开发手册 development](./development.md) | 源码结构、构建、发布、贡献指南 |

## 快速上手（30 秒）

```sh
npm install @jiobozi-dev-org/dsh-email-summary
npm install @jiobozi-dev-org/dsh-client-ui-email-summary
```

在 `cordis.yml` 加两行：

```yaml
- id: email-summary
  name: '@jiobozi-dev-org/dsh-email-summary'
- id: ui-email-summary
  name: '@jiobozi-dev-org/dsh-client-ui-email-summary'
```

到 **设置 → Plugins → 可配置 → 邮件通知** 选预设、填账号授权码即可。
