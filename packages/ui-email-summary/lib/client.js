window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-email-summary",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		//#region lib/types/client/EmailSendAction.js
		/**
		* One assistant-message "send email" action in the message IconActions row.
		* @module @deepseek-ai/dsh-client-ui-email-summary/client/EmailSendAction
		*/
		/**
		* A single button that summarizes the current conversation and emails it.
		* @param props - the injected `send` verb and the bound translator.
		*/
		function EmailSendAction({ send, t }) {
			const [pending, setPending] = (0, react.useState)(false);
			const [failure, setFailure] = (0, react.useState)(null);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: (0, react.useCallback)(() => {
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
				]),
				disabled: pending,
				title: t("send.title"),
				style: { cursor: pending ? "wait" : "pointer" },
				children: pending ? t("send.pending") : t("send.label")
			}), failure !== null && (0, react_jsx_runtime.jsx)("span", {
				role: "status",
				style: {
					color: "var(--dsh-color-danger, #c0392b)",
					fontSize: 12
				},
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
		* Email-summary settings page: provider preset, SMTP fields, password, and
		* summary preference, persisted through the `remote.emailSummary` Host Remote.
		* @module @deepseek-ai/dsh-client-ui-email-summary/client/EmailSettingsSection
		*/
		const row = {
			display: "flex",
			flexDirection: "column",
			gap: 4
		};
		const field = {
			padding: "6px 8px",
			borderRadius: 4
		};
		/**
		* A plain form: the provider select fills host/port/security from the preset;
		* Save writes settings and (when entered) the credential-backed password.
		* @param props - the injected Remote and bound translator.
		*/
		function EmailSettingsSection({ api, t }) {
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
			return (0, react_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					gap: 14,
					maxWidth: 560
				},
				children: [
					(0, react_jsx_runtime.jsxs)("label", {
						style: row,
						children: [(0, react_jsx_runtime.jsx)("span", { children: t("settings.provider") }), (0, react_jsx_runtime.jsx)("select", {
							style: field,
							value: settings.provider,
							onChange: (event) => onProvider(event.target.value),
							children: presets.map((preset) => (0, react_jsx_runtime.jsx)("option", {
								value: preset.id,
								children: preset.label
							}, preset.id))
						})]
					}),
					(0, react_jsx_runtime.jsxs)("label", {
						style: row,
						children: [(0, react_jsx_runtime.jsx)("span", { children: t("settings.host") }), (0, react_jsx_runtime.jsx)("input", {
							style: field,
							value: settings.smtpHost,
							onChange: (event) => patch({ smtpHost: event.target.value })
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: 14
						},
						children: [(0, react_jsx_runtime.jsxs)("label", {
							style: {
								...row,
								flex: 1
							},
							children: [(0, react_jsx_runtime.jsx)("span", { children: t("settings.port") }), (0, react_jsx_runtime.jsx)("input", {
								style: field,
								type: "number",
								value: settings.smtpPort,
								onChange: (event) => patch({ smtpPort: Number(event.target.value) })
							})]
						}), (0, react_jsx_runtime.jsxs)("label", {
							style: {
								...row,
								flex: 1
							},
							children: [(0, react_jsx_runtime.jsx)("span", { children: t("settings.secure") }), (0, react_jsx_runtime.jsxs)("select", {
								style: field,
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
							})]
						})]
					}),
					(0, react_jsx_runtime.jsxs)("label", {
						style: row,
						children: [(0, react_jsx_runtime.jsx)("span", { children: t("settings.username") }), (0, react_jsx_runtime.jsx)("input", {
							style: field,
							value: settings.username,
							onChange: (event) => patch({ username: event.target.value })
						})]
					}),
					(0, react_jsx_runtime.jsxs)("label", {
						style: row,
						children: [(0, react_jsx_runtime.jsx)("span", { children: t("settings.password") }), (0, react_jsx_runtime.jsx)("input", {
							style: field,
							type: "password",
							value: password,
							placeholder: t("settings.passwordHint"),
							onChange: (event) => setPassword(event.target.value)
						})]
					}),
					(0, react_jsx_runtime.jsxs)("label", {
						style: row,
						children: [(0, react_jsx_runtime.jsx)("span", { children: t("settings.from") }), (0, react_jsx_runtime.jsx)("input", {
							style: field,
							value: settings.from,
							onChange: (event) => patch({ from: event.target.value })
						})]
					}),
					(0, react_jsx_runtime.jsxs)("label", {
						style: row,
						children: [(0, react_jsx_runtime.jsx)("span", { children: t("settings.recipient") }), (0, react_jsx_runtime.jsx)("input", {
							style: field,
							value: settings.defaultRecipient,
							onChange: (event) => patch({ defaultRecipient: event.target.value })
						})]
					}),
					(0, react_jsx_runtime.jsxs)("label", {
						style: row,
						children: [(0, react_jsx_runtime.jsx)("span", { children: t("settings.style") }), (0, react_jsx_runtime.jsxs)("select", {
							style: field,
							value: settings.style,
							onChange: (event) => patch({ style: event.target.value }),
							children: [(0, react_jsx_runtime.jsx)("option", {
								value: "detailed",
								children: t("settings.detailed")
							}), (0, react_jsx_runtime.jsx)("option", {
								value: "brief",
								children: t("settings.brief")
							})]
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: 12
						},
						children: [(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onSave,
							disabled: saving,
							children: saving ? t("settings.saving") : t("settings.save")
						}), message !== null && (0, react_jsx_runtime.jsx)("span", {
							role: "status",
							children: message
						})]
					}),
					(0, react_jsx_runtime.jsx)("p", {
						style: {
							fontSize: 12,
							opacity: .7,
							margin: 0
						},
						children: t("settings.passwordHint")
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** `email` namespace dictionaries. */
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"nav": "邮件通知",
			"send.label": "发送邮件",
			"send.title": "把当前对话总结成 Markdown 并通过邮件发送",
			"send.pending": "发送中…",
			"send.done": "已发送",
			"send.failed": "发送失败",
			"toggle.label": "结束后发送",
			"toggle.title": "本次对话结束后自动总结并发送到默认收件人",
			"settings.provider": "邮箱服务商",
			"settings.host": "SMTP 主机",
			"settings.port": "端口",
			"settings.secure": "加密方式",
			"settings.username": "登录账号",
			"settings.password": "密码 / 授权码",
			"settings.passwordHint": "留空则不修改；通过环境变量 EMAIL_SMTP_PASSWORD 安全存储",
			"settings.from": "发件人邮箱",
			"settings.recipient": "默认收件人",
			"settings.style": "总结详略",
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
			"send.label": "Send email",
			"send.title": "Summarize this conversation as Markdown and email it",
			"send.pending": "Sending…",
			"send.done": "Sent",
			"send.failed": "Send failed",
			"toggle.label": "Send when done",
			"toggle.title": "Automatically summarize and email this conversation to the default recipient when it ends",
			"settings.provider": "Provider",
			"settings.host": "SMTP host",
			"settings.port": "Port",
			"settings.secure": "Security",
			"settings.username": "Username",
			"settings.password": "Password / app password",
			"settings.passwordHint": "Leave blank to keep unchanged; stored via the EMAIL_SMTP_PASSWORD environment variable",
			"settings.from": "From address",
			"settings.recipient": "Default recipient",
			"settings.style": "Summary detail",
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
			ctx.slots.inject("settings.section", () => {
				const dispose = ctx.slots.register({
					name: "settings.section",
					id: "email-summary",
					order: 60,
					label: () => t("nav"),
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