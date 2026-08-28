window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-email-summary",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region \0dsh-css:D:\public\deepseek-harness\packages\client\ui-email-summary\src\client\EmailSendAction.module.css.mjs
		const css = ".UYZKjW_action{width:28px;height:28px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;border-radius:28px;justify-content:center;align-items:center;padding:6px;display:inline-flex}.UYZKjW_action:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}.UYZKjW_action:disabled{cursor:default;opacity:.4}.UYZKjW_failure{text-overflow:ellipsis;white-space:nowrap;max-width:220px;color:var(--dsw-alias-label-tertiary);padding-left:4px;font-size:13px;line-height:20px;overflow:hidden}";
		const tagId = "@deepseek-ai/dsh-client-ui-email-summary/EmailSendAction.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-email-summary";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var EmailSendAction_module_css_default = {
			"action": "UYZKjW_action",
			"failure": "UYZKjW_failure"
		};
		//#endregion
		//#region lib/types/client/EmailSendAction.js
		/**
		* One assistant-message "send email" action in the message IconActions row.
		* Rendered as a circular icon button with a Tooltip, matching the shared
		* action chrome (copy / like / dislike).
		* @module @deepseek-ai/dsh-client-ui-email-summary/client/EmailSendAction
		*/
		/**
		* A single icon button that summarizes the current conversation and emails it.
		* @param props - the injected `send` verb and the bound translator.
		*/
		function EmailSendAction({ send, t }) {
			const [pending, setPending] = (0, react.useState)(false);
			const [failure, setFailure] = (0, react.useState)(null);
			const onClick = (0, react.useCallback)(() => {
				if (pending) return;
				setPending(true);
				setFailure(null);
				send().then((result) => {
					setPending(false);
					if (!result.ok) setFailure(result.error ?? t("send.failed"));
				});
			}, [
				pending,
				send,
				t
			]);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label: pending ? t("send.pending") : t("send.label"),
				side: "bottom",
				children: (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: EmailSendAction_module_css_default.action,
					"aria-label": t("send.label"),
					disabled: pending,
					onClick,
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSendOutline16, {})
				})
			}), failure !== null && (0, react_jsx_runtime.jsx)("span", {
				className: EmailSendAction_module_css_default.failure,
				role: "status",
				children: failure
			})] });
		}
		//#endregion
		//#region lib/types/client/AutosendToggle.js
		/**
		* Composer auto-send toggle: arm/disarm "summarize + email at conversation end".
		* @module @deepseek-ai/dsh-client-ui-email-summary/client/AutosendToggle
		*/
		/**
		* A checkbox in the composer tool row. When checked, the Host summarizes and
		* emails the conversation to the default recipient once the agent goes idle.
		* @param props - the injected Remote, session id, and bound translator.
		*/
		function AutosendToggle({ api, sessionId, t }) {
			const [armed, setArmed] = (0, react.useState)(false);
			const [configured, setConfigured] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				let alive = true;
				api.status({ sessionId }).then((status) => {
					if (!alive) return;
					setArmed(status.armed);
					setConfigured(status.configured);
				});
				return () => {
					alive = false;
				};
			}, [api, sessionId]);
			const onChange = (0, react.useCallback)(() => {
				const next = !armed;
				setArmed(next);
				api.armAutosend({
					sessionId,
					enabled: next
				});
			}, [
				armed,
				api,
				sessionId
			]);
			return (0, react_jsx_runtime.jsxs)("label", {
				title: t("toggle.title"),
				style: {
					display: "inline-flex",
					alignItems: "center",
					gap: 4
				},
				children: [(0, react_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: armed,
					onChange,
					disabled: !configured
				}), (0, react_jsx_runtime.jsx)("span", {
					style: { fontSize: 12 },
					children: t("toggle.label")
				})]
			});
		}
		//#endregion
		//#region lib/types/client/EmailSettingsSection.js
		/**
		* Email-summary plugin configuration card (shown in Settings → Plugins).
		* Collapsed by default, like the built-in plugin cards; expanding reveals the
		* SMTP + summary form, whose fields are persisted through the Host Remote.
		* @module @deepseek-ai/dsh-client-ui-email-summary/client/EmailSettingsSection
		*/
		const card = {
			margin: 0,
			padding: 0,
			listStyle: "none"
		};
		const headerBtn = {
			display: "flex",
			alignItems: "center",
			justifyContent: "space-between",
			gap: 12,
			width: "100%",
			padding: "14px 16px",
			border: "none",
			background: "transparent",
			cursor: "pointer",
			textAlign: "left",
			color: "inherit"
		};
		const headerText = {
			display: "flex",
			flexDirection: "column",
			alignItems: "flex-start",
			gap: 2
		};
		const title = {
			fontWeight: 600,
			fontSize: 15
		};
		const desc = {
			fontSize: 12,
			opacity: .65
		};
		const chevron = {
			fontSize: 12,
			opacity: .6,
			flexShrink: 0
		};
		const body = {
			padding: "4px 16px 16px",
			display: "flex",
			flexDirection: "column",
			gap: 14,
			maxWidth: 560
		};
		const groupLabel = {
			fontSize: 12,
			fontWeight: 600,
			color: "#2563eb",
			marginBottom: 2
		};
		const fieldRow = {
			display: "flex",
			flexDirection: "column",
			gap: 4
		};
		const fieldLabel = {
			fontSize: 13,
			fontWeight: 500
		};
		const fieldHint = {
			fontSize: 11,
			opacity: .55
		};
		const input = {
			padding: "8px 10px",
			borderRadius: 6,
			border: "1px solid rgba(0,0,0,0.18)",
			fontSize: 14,
			background: "#fff",
			width: "100%"
		};
		const inlineRow = {
			display: "flex",
			gap: 14
		};
		const inlineCol = {
			...fieldRow,
			flex: 1
		};
		const footer = {
			display: "flex",
			alignItems: "center",
			gap: 12,
			marginTop: 4
		};
		const saveBtn = {
			padding: "8px 18px",
			borderRadius: 6,
			border: "none",
			background: "#2563eb",
			color: "#fff",
			fontSize: 14,
			fontWeight: 500,
			cursor: "pointer"
		};
		const statusText = { fontSize: 13 };
		/** A section header: the SMTP fields or the summary preference. */
		function FieldGroup({ label, children }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					gap: 10
				},
				children: [(0, react_jsx_runtime.jsx)("div", {
					style: groupLabel,
					children: label
				}), children]
			});
		}
		/**
		* The collapsible configuration card.
		* @param props - the injected Remote and bound translator.
		*/
		function EmailSettingsSection({ api, t }) {
			const [open, setOpen] = (0, react.useState)(false);
			const [settings, setSettings] = (0, react.useState)(null);
			const [presets, setPresets] = (0, react.useState)([]);
			const [password, setPassword] = (0, react.useState)("");
			const [saving, setSaving] = (0, react.useState)(false);
			const [message, setMessage] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				let alive = true;
				api.getSettings().then((result) => {
					if (!alive) return;
					setSettings(result.settings);
					setPresets(result.presets);
				});
				return () => {
					alive = false;
				};
			}, [api]);
			const patch = (0, react.useCallback)((partial) => {
				setSettings((current) => current === null ? current : {
					...current,
					...partial
				});
			}, []);
			const onProvider = (0, react.useCallback)((id) => {
				const preset = presets.find((item) => item.id === id);
				if (preset !== void 0) patch({
					provider: id,
					smtpHost: preset.host,
					smtpPort: preset.port,
					secure: preset.secure
				});
				else patch({ provider: id });
			}, [presets, patch]);
			const onSave = (0, react.useCallback)(() => {
				if (settings === null || saving) return;
				setSaving(true);
				setMessage(null);
				(async () => {
					const saved = await api.saveSettings({ patch: settings });
					if (password !== "") await api.setPassword({ password });
					setSaving(false);
					setMessage(saved.ok ? t("settings.saved") : saved.error ?? t("settings.error"));
				})();
			}, [
				settings,
				saving,
				password,
				api,
				t
			]);
			if (settings === null) return null;
			return (0, react_jsx_runtime.jsxs)("li", {
				style: card,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					style: headerBtn,
					"aria-expanded": open,
					onClick: () => {
						setOpen(!open);
					},
					children: [(0, react_jsx_runtime.jsxs)("span", {
						style: headerText,
						children: [(0, react_jsx_runtime.jsx)("span", {
							style: title,
							children: t("nav")
						}), (0, react_jsx_runtime.jsx)("span", {
							style: desc,
							children: t("desc")
						})]
					}), (0, react_jsx_runtime.jsx)("span", {
						style: chevron,
						children: open ? "▾" : "▸"
					})]
				}), open && (0, react_jsx_runtime.jsxs)("div", {
					style: body,
					children: [
						(0, react_jsx_runtime.jsx)(FieldGroup, {
							label: t("settings.provider"),
							children: (0, react_jsx_runtime.jsx)("select", {
								style: input,
								value: settings.provider,
								onChange: (event) => onProvider(event.target.value),
								children: presets.map((preset) => (0, react_jsx_runtime.jsx)("option", {
									value: preset.id,
									children: preset.label
								}, preset.id))
							})
						}),
						(0, react_jsx_runtime.jsxs)(FieldGroup, {
							label: t("settings.host"),
							children: [(0, react_jsx_runtime.jsx)("input", {
								style: input,
								value: settings.smtpHost,
								onChange: (event) => patch({ smtpHost: event.target.value })
							}), (0, react_jsx_runtime.jsx)("div", {
								style: fieldHint,
								children: t("settings.hostHint")
							})]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							style: inlineRow,
							children: [(0, react_jsx_runtime.jsxs)("label", {
								style: inlineCol,
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										style: fieldLabel,
										children: t("settings.port")
									}),
									(0, react_jsx_runtime.jsx)("input", {
										style: input,
										type: "number",
										value: settings.smtpPort,
										onChange: (event) => patch({ smtpPort: Number(event.target.value) })
									}),
									(0, react_jsx_runtime.jsx)("span", {
										style: fieldHint,
										children: t("settings.portHint")
									})
								]
							}), (0, react_jsx_runtime.jsxs)("label", {
								style: inlineCol,
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										style: fieldLabel,
										children: t("settings.secure")
									}),
									(0, react_jsx_runtime.jsxs)("select", {
										style: input,
										value: settings.secure,
										onChange: (event) => patch({ secure: event.target.value }),
										children: [
											(0, react_jsx_runtime.jsx)("option", {
												value: "starttls",
												children: "STARTTLS"
											}),
											(0, react_jsx_runtime.jsx)("option", {
												value: "ssl",
												children: "SSL"
											}),
											(0, react_jsx_runtime.jsx)("option", {
												value: "none",
												children: "None"
											})
										]
									}),
									(0, react_jsx_runtime.jsx)("span", {
										style: fieldHint,
										children: t("settings.secureHint")
									})
								]
							})]
						}),
						(0, react_jsx_runtime.jsxs)(FieldGroup, {
							label: t("settings.username"),
							children: [(0, react_jsx_runtime.jsx)("input", {
								style: input,
								value: settings.username,
								onChange: (event) => patch({ username: event.target.value })
							}), (0, react_jsx_runtime.jsx)("div", {
								style: fieldHint,
								children: t("settings.usernameHint")
							})]
						}),
						(0, react_jsx_runtime.jsx)(FieldGroup, {
							label: t("settings.password"),
							children: (0, react_jsx_runtime.jsx)("input", {
								style: input,
								type: "password",
								value: password,
								placeholder: t("settings.passwordHint"),
								onChange: (event) => setPassword(event.target.value)
							})
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							style: inlineRow,
							children: [(0, react_jsx_runtime.jsxs)("label", {
								style: inlineCol,
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										style: fieldLabel,
										children: t("settings.from")
									}),
									(0, react_jsx_runtime.jsx)("input", {
										style: input,
										value: settings.from,
										onChange: (event) => patch({ from: event.target.value })
									}),
									(0, react_jsx_runtime.jsx)("span", {
										style: fieldHint,
										children: t("settings.fromHint")
									})
								]
							}), (0, react_jsx_runtime.jsxs)("label", {
								style: inlineCol,
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										style: fieldLabel,
										children: t("settings.recipient")
									}),
									(0, react_jsx_runtime.jsx)("input", {
										style: input,
										value: settings.defaultRecipient,
										onChange: (event) => patch({ defaultRecipient: event.target.value })
									}),
									(0, react_jsx_runtime.jsx)("span", {
										style: fieldHint,
										children: t("settings.recipientHint")
									})
								]
							})]
						}),
						(0, react_jsx_runtime.jsxs)(FieldGroup, {
							label: t("settings.style"),
							children: [(0, react_jsx_runtime.jsxs)("select", {
								style: input,
								value: settings.style,
								onChange: (event) => patch({ style: event.target.value }),
								children: [(0, react_jsx_runtime.jsx)("option", {
									value: "detailed",
									children: t("settings.detailed")
								}), (0, react_jsx_runtime.jsx)("option", {
									value: "brief",
									children: t("settings.brief")
								})]
							}), (0, react_jsx_runtime.jsx)("div", {
								style: fieldHint,
								children: t("settings.styleHint")
							})]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							style: footer,
							children: [(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: saveBtn,
								onClick: onSave,
								disabled: saving,
								children: saving ? t("settings.saving") : t("settings.save")
							}), message !== null && (0, react_jsx_runtime.jsx)("span", {
								style: statusText,
								role: "status",
								children: message
							})]
						})
					]
				})]
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** `email` namespace dictionaries. */
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"nav": "邮件通知",
			"desc": "把对话总结成 HTML 邮件并发送到指定邮箱",
			"send.label": "发送邮件",
			"send.title": "把当前对话总结成 HTML 邮件并发送",
			"send.pending": "发送中…",
			"send.done": "已发送",
			"send.failed": "发送失败",
			"toggle.label": "结束后发送",
			"toggle.title": "本次对话结束后自动总结并发送到默认收件人",
			"settings.provider": "邮箱服务商",
			"settings.host": "SMTP 主机",
			"settings.hostHint": "例如 smtp.qq.com / smtp.163.com",
			"settings.port": "端口",
			"settings.portHint": "465（SSL）或 587（STARTTLS）",
			"settings.secure": "加密方式",
			"settings.secureHint": "SSL 走 465，STARTTLS 走 587",
			"settings.username": "登录账号",
			"settings.usernameHint": "通常是你的完整邮箱地址",
			"settings.password": "密码 / 授权码",
			"settings.passwordHint": "留空则不修改；通过环境变量 EMAIL_SMTP_PASSWORD 安全存储",
			"settings.from": "发件人邮箱",
			"settings.fromHint": "默认与登录账号相同",
			"settings.recipient": "默认收件人",
			"settings.recipientHint": "「结束后发送」和未指定收件人时使用",
			"settings.style": "总结详略",
			"settings.styleHint": "详细版更完整，简短版更凝练",
			"settings.detailed": "详细",
			"settings.brief": "简短",
			"settings.save": "保存",
			"settings.saving": "保存中…",
			"settings.saved": "已保存",
			"settings.error": "保存失败"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"nav": "Email",
			"desc": "Summarize conversations into HTML emails and send them over SMTP",
			"send.label": "Send email",
			"send.title": "Summarize this conversation as an HTML email and send it",
			"send.pending": "Sending…",
			"send.done": "Sent",
			"send.failed": "Send failed",
			"toggle.label": "Send when done",
			"toggle.title": "Automatically summarize and email this conversation to the default recipient when it ends",
			"settings.provider": "Provider",
			"settings.host": "SMTP host",
			"settings.hostHint": "e.g. smtp.qq.com / smtp.163.com",
			"settings.port": "Port",
			"settings.portHint": "465 (SSL) or 587 (STARTTLS)",
			"settings.secure": "Security",
			"settings.secureHint": "SSL uses 465, STARTTLS uses 587",
			"settings.username": "Username",
			"settings.usernameHint": "Usually your full email address",
			"settings.password": "Password / app password",
			"settings.passwordHint": "Leave blank to keep unchanged; stored via the EMAIL_SMTP_PASSWORD environment variable",
			"settings.from": "From address",
			"settings.fromHint": "Defaults to your username",
			"settings.recipient": "Default recipient",
			"settings.recipientHint": "Used by \"send when done\" and when no recipient is given",
			"settings.style": "Summary detail",
			"settings.styleHint": "Detailed is fuller; brief is more concise",
			"settings.detailed": "Detailed",
			"settings.brief": "Brief",
			"settings.save": "Save",
			"settings.saving": "Saving…",
			"settings.saved": "Saved",
			"settings.error": "Save failed"
		};
		//#endregion
		//#region lib/types/client/index.js
		/**
		* Email-summary surface plugin, browser half: a settings page, a per-message
		* "send email" action, and a composer auto-send toggle, all backed by the
		* generated `remote.emailSummary` Host Remote.
		* @module @deepseek-ai/dsh-client-ui-email-summary/client
		*/
		/** Dictionary namespace owned by this plugin. */
		const NS = "email";
		/** Required services: the slot registry, the Remote namespace, and the copy. */
		const inject = [
			"slots",
			"locale",
			"remote",
			"remote.emailSummary"
		];
		/** Read a Remote failure as a human-readable string. */
		function errorText(failure) {
			if (failure == null) return "远程调用失败";
			if (typeof failure === "string") return failure;
			const record = failure;
			return typeof record.message === "string" ? record.message : "远程调用失败";
		}
		/**
		* Client plugin body: registers the settings page, the send action, and the
		* composer toggle once their owning slots are on the ledger.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-email-summary: dictionaries");
			const remote = ctx.remote.emailSummary;
			const t = ctx.locale.bind(NS);
			const api = {
				sendNow: (request) => remote.sendNow(request).then((result) => result.ok ? result.value : {
					ok: false,
					recipient: request.recipient ?? "",
					subject: request.subject ?? "",
					summaryChars: 0,
					transcriptChars: 0,
					error: errorText(result.error)
				}),
				armAutosend: (request) => remote.armAutosend(request).then((result) => result.ok ? result.value : {
					ok: false,
					armed: false
				}),
				status: (request) => remote.status(request).then((result) => result.ok ? result.value : {
					configured: false,
					defaultRecipient: "",
					armed: false,
					presets: []
				}),
				getSettings: () => remote.getSettings().then((result) => {
					if (result.ok) return result.value;
					throw new Error(errorText(result.error));
				}),
				saveSettings: (request) => remote.saveSettings(request).then((result) => result.ok ? result.value : {
					ok: false,
					error: errorText(result.error)
				}),
				setPassword: (request) => remote.setPassword(request).then((result) => result.ok ? result.value : {
					ok: false,
					error: errorText(result.error)
				})
			};
			ctx.slots.inject("settings.plugin.item", () => {
				const dispose = ctx.slots.register({
					name: "settings.plugin.item",
					key: "email-summary",
					locale: NS,
					inject: () => ({
						api,
						t
					})
				}, EmailSettingsSection);
				return () => dispose();
			});
			ctx.slots.inject("conversation.chat.assistant-actions", () => {
				const dispose = ctx.slots.register({
					name: "conversation.chat.assistant-actions",
					id: "email-summary",
					order: 20,
					locale: NS,
					inject: (sessionId) => ({
						t,
						send: () => api.sendNow({ sessionId })
					})
				}, EmailSendAction);
				return () => dispose();
			});
			ctx.slots.inject("conversation.input.right", () => {
				const dispose = ctx.slots.register({
					name: "conversation.input.right",
					id: "email-summary",
					order: 0,
					locale: NS,
					inject: (sessionId) => ({
						api,
						t,
						sessionId
					})
				}, AutosendToggle);
				return () => dispose();
			});
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map