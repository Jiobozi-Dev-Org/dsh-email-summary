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
		const css$1 = ".UYZKjW_actionPill{height:28px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;border-radius:14px;justify-content:center;align-items:center;gap:4px;padding:0 10px;font-size:13px;display:inline-flex}.UYZKjW_actionPill:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}.UYZKjW_actionPill:disabled{cursor:default;opacity:.4}.UYZKjW_failure{text-overflow:ellipsis;white-space:nowrap;max-width:220px;color:var(--dsw-alias-label-tertiary);padding-left:4px;font-size:13px;line-height:20px;overflow:hidden}";
		const tagId$1 = "@deepseek-ai/dsh-client-ui-email-summary/EmailSendAction.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-email-summary";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var EmailSendAction_module_css_default = {
			"actionPill": "UYZKjW_actionPill",
			"failure": "UYZKjW_failure"
		};
		//#endregion
		//#region lib/types/client/EmailSendAction.js
		/**
		* One assistant-message "send email" action in the message IconActions row.
		* Rendered as a pill button with an icon + label, using the shared theme
		* tokens so it sits consistently beside the copy / like / dislike icons.
		* @module @deepseek-ai/dsh-client-ui-email-summary/client/EmailSendAction
		*/
		/**
		* A pill button that summarizes the current conversation and emails it.
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
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: EmailSendAction_module_css_default.actionPill,
				disabled: pending,
				title: t("send.title"),
				onClick,
				children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSendOutline16, { size: 14 }), (0, react_jsx_runtime.jsx)("span", { children: pending ? t("send.pending") : t("send.label") })]
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
		//#region \0dsh-css:D:\public\deepseek-harness\packages\client\ui-email-summary\src\client\EmailCard.module.css.mjs
		const css = ".NRWTCa_card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;margin:0;padding:0;list-style:none;transition:border-color .16s,background .16s}.NRWTCa_card:hover{border-color:var(--dsw-alias-label-dimmed)}.NRWTCa_cardOpen{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-label-dimmed)}.NRWTCa_header{appearance:none;width:100%;font:inherit;color:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:12px;align-items:center;gap:12px;padding:14px 16px;display:flex}.NRWTCa_header:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}.NRWTCa_headText{flex-direction:column;flex:1;gap:4px;min-width:0;display:flex}.NRWTCa_name{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:600;line-height:1.4}.NRWTCa_description{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.5}.NRWTCa_chevron{color:var(--dsw-alias-label-tertiary);flex:none;transition:transform .16s}.NRWTCa_chevronOpen{transform:rotate(180deg)}.NRWTCa_body{border-top:1px solid var(--dsw-alias-border-l2);flex-direction:column;gap:14px;max-width:560px;margin:0 16px;padding:16px 0 8px;display:flex}.NRWTCa_footer{border-top:1px solid var(--dsw-alias-border-l2);justify-content:flex-end;align-items:center;gap:8px;padding:12px 0 4px;display:flex}.NRWTCa_failed{min-width:0;color:var(--dsw-alias-label-error);flex:1;margin:0;font-size:12px;line-height:1.5}.NRWTCa_discard,.NRWTCa_save{appearance:none;font:inherit;cursor:pointer;border:1px solid #0000;border-radius:8px;padding:5px 14px;font-size:13px;line-height:1.5}.NRWTCa_discard{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);background:0 0}.NRWTCa_discard:hover:not(:disabled){color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-dimmed)}.NRWTCa_save{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-3)}.NRWTCa_discard:disabled,.NRWTCa_save:disabled{opacity:.4;cursor:default}";
		const tagId = "@deepseek-ai/dsh-client-ui-email-summary/EmailCard.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-email-summary";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var EmailCard_module_css_default = {
			"body": "NRWTCa_body",
			"card": "NRWTCa_card",
			"cardOpen": "NRWTCa_cardOpen",
			"chevron": "NRWTCa_chevron",
			"chevronOpen": "NRWTCa_chevronOpen",
			"description": "NRWTCa_description",
			"discard": "NRWTCa_discard",
			"failed": "NRWTCa_failed",
			"footer": "NRWTCa_footer",
			"headText": "NRWTCa_headText",
			"header": "NRWTCa_header",
			"name": "NRWTCa_name",
			"save": "NRWTCa_save"
		};
		//#endregion
		//#region lib/types/client/EmailSettingsSection.js
		/**
		* Email-summary plugin configuration card (shown in Settings → Plugins).
		* Collapsed by default, mirroring the shared PluginCard chrome so it sits
		* beside the built-in shell / agent-loop / web-search cards identically.
		* @module @deepseek-ai/dsh-client-ui-email-summary/client/EmailSettingsSection
		*/
		const groupLabel = {
			fontSize: 12,
			fontWeight: 600,
			color: "#2563eb",
			marginBottom: 2
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
			display: "flex",
			flexDirection: "column",
			gap: 4,
			flex: 1
		};
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
			const [defaultPrompts, setDefaultPrompts] = (0, react.useState)({
				brief: "",
				detailed: ""
			});
			const [saving, setSaving] = (0, react.useState)(false);
			const [message, setMessage] = (0, react.useState)(null);
			const [reportStatus, setReportStatus] = (0, react.useState)(null);
			const [reporting, setReporting] = (0, react.useState)(false);
			const [reportMessage, setReportMessage] = (0, react.useState)(null);
			const refreshReportStatus = (0, react.useCallback)(() => {
				api.reportStatus().then(setReportStatus);
			}, [api]);
			const onReportNow = (0, react.useCallback)(() => {
				if (reporting) return;
				setReporting(true);
				setReportMessage(null);
				api.reportNow().then((result) => {
					setReporting(false);
					if (result.ok) setReportMessage(`${t("settings.reportNowSent")}（${result.count} 个会话）`);
					else setReportMessage(`${t("settings.reportNowFailed")}：${result.error ?? ""}`);
					refreshReportStatus();
				});
			}, [
				reporting,
				api,
				t,
				refreshReportStatus
			]);
			(0, react.useEffect)(() => {
				let alive = true;
				api.getSettings().then((result) => {
					if (!alive) return;
					setPresets(result.presets);
					setDefaultPrompts(result.defaultPrompts);
					const style = result.settings.style === "brief" ? "brief" : "detailed";
					setSettings({
						...result.settings,
						prompt: (result.settings.prompt ?? "").trim() !== "" ? result.settings.prompt : result.defaultPrompts[style]
					});
				});
				refreshReportStatus();
				return () => {
					alive = false;
				};
			}, [api, refreshReportStatus]);
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
			const restoreDefaultPrompt = (0, react.useCallback)(() => {
				if (settings === null) return;
				const def = defaultPrompts[settings.style === "brief" ? "brief" : "detailed"];
				if (def !== "") setSettings((current) => current === null ? current : {
					...current,
					prompt: def
				});
			}, [settings, defaultPrompts]);
			const onStyleChange = (0, react.useCallback)((nextStyle) => {
				setSettings((current) => {
					if (current === null) return current;
					const style = nextStyle === "brief" ? "brief" : "detailed";
					const currentPrompt = (current.prompt ?? "").trim();
					const isDefault = currentPrompt === "" || currentPrompt === defaultPrompts.brief.trim() || currentPrompt === defaultPrompts.detailed.trim();
					return {
						...current,
						style,
						prompt: isDefault ? defaultPrompts[style] ?? current.prompt : current.prompt
					};
				});
			}, [defaultPrompts]);
			const onSave = (0, react.useCallback)(() => {
				if (settings === null || saving) return;
				setSaving(true);
				setMessage(null);
				(async () => {
					const def = (defaultPrompts[settings.style === "brief" ? "brief" : "detailed"] ?? "").trim();
					const promptText = (settings.prompt ?? "").trim();
					const customPrompt = promptText === "" || promptText === def ? "" : settings.prompt;
					const patchValue = {
						...settings,
						prompt: customPrompt
					};
					const saved = await api.saveSettings({ patch: patchValue });
					if (password !== "") await api.setPassword({ password });
					setSaving(false);
					setMessage(saved.ok ? t("settings.saved") : saved.error ?? t("settings.error"));
					refreshReportStatus();
				})();
			}, [
				settings,
				saving,
				password,
				defaultPrompts,
				api,
				t,
				refreshReportStatus
			]);
			const discard = (0, react.useCallback)(() => {
				if (saving) return;
				setMessage(null);
				api.getSettings().then((result) => {
					const style = result.settings.style === "brief" ? "brief" : "detailed";
					setSettings({
						...result.settings,
						prompt: (result.settings.prompt ?? "").trim() !== "" ? result.settings.prompt : result.defaultPrompts[style]
					});
					setPresets(result.presets);
					setDefaultPrompts(result.defaultPrompts);
					setPassword("");
					refreshReportStatus();
				});
			}, [
				saving,
				api,
				refreshReportStatus
			]);
			if (settings === null) return null;
			return (0, react_jsx_runtime.jsxs)("li", {
				className: open ? `${EmailCard_module_css_default.card} ${EmailCard_module_css_default.cardOpen}` : EmailCard_module_css_default.card,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: EmailCard_module_css_default.header,
					"aria-expanded": open,
					onClick: () => {
						setOpen(!open);
					},
					children: [(0, react_jsx_runtime.jsxs)("span", {
						className: EmailCard_module_css_default.headText,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: EmailCard_module_css_default.name,
							children: t("nav")
						}), (0, react_jsx_runtime.jsx)("span", {
							className: EmailCard_module_css_default.description,
							children: t("desc")
						})]
					}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, { className: open ? `${EmailCard_module_css_default.chevron} ${EmailCard_module_css_default.chevronOpen}` : EmailCard_module_css_default.chevron })]
				}), open && (0, react_jsx_runtime.jsxs)("div", {
					className: EmailCard_module_css_default.body,
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
								onChange: (event) => onStyleChange(event.target.value),
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
						(0, react_jsx_runtime.jsxs)(FieldGroup, {
							label: t("settings.prompt"),
							children: [
								(0, react_jsx_runtime.jsx)("textarea", {
									style: {
										...input,
										minHeight: 120,
										resize: "vertical",
										fontFamily: "ui-monospace,Consolas,monospace",
										fontSize: 13,
										lineHeight: 1.5
									},
									value: settings.prompt,
									placeholder: t("settings.promptPlaceholder"),
									onChange: (event) => patch({ prompt: event.target.value })
								}),
								(0, react_jsx_runtime.jsx)("div", {
									style: fieldHint,
									children: t("settings.promptHint")
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									style: {
										padding: "4px 8px",
										borderRadius: 6,
										border: "1px solid rgba(0,0,0,0.15)",
										background: "transparent",
										color: "#2563eb",
										fontSize: 12,
										cursor: "pointer",
										alignSelf: "flex-start"
									},
									onClick: restoreDefaultPrompt,
									children: t("settings.restoreDefaultPrompt")
								})
							]
						}),
						(0, react_jsx_runtime.jsxs)(FieldGroup, {
							label: t("settings.report"),
							children: [
								(0, react_jsx_runtime.jsxs)("label", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: 8
									},
									children: [(0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: settings.reportEnabled,
										onChange: (event) => patch({ reportEnabled: event.target.checked })
									}), (0, react_jsx_runtime.jsx)("span", {
										style: fieldLabel,
										children: t("settings.reportEnabled")
									})]
								}),
								(0, react_jsx_runtime.jsx)("div", {
									style: fieldHint,
									children: t("settings.reportHint")
								}),
								settings.reportEnabled && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
									(0, react_jsx_runtime.jsxs)("div", {
										style: inlineRow,
										children: [(0, react_jsx_runtime.jsxs)("label", {
											style: inlineCol,
											children: [(0, react_jsx_runtime.jsx)("span", {
												style: fieldLabel,
												children: t("settings.reportFrequency")
											}), (0, react_jsx_runtime.jsxs)("select", {
												style: input,
												value: settings.reportFrequency,
												onChange: (event) => patch({ reportFrequency: event.target.value }),
												children: [(0, react_jsx_runtime.jsx)("option", {
													value: "daily",
													children: t("settings.daily")
												}), (0, react_jsx_runtime.jsx)("option", {
													value: "weekly",
													children: t("settings.weekly")
												})]
											})]
										}), (0, react_jsx_runtime.jsxs)("label", {
											style: inlineCol,
											children: [
												(0, react_jsx_runtime.jsx)("span", {
													style: fieldLabel,
													children: t("settings.reportTime")
												}),
												(0, react_jsx_runtime.jsx)("input", {
													type: "time",
													style: input,
													value: /^\d{2}:\d{2}$/.test(settings.reportTime) ? settings.reportTime : "09:00",
													onChange: (event) => patch({ reportTime: event.target.value })
												}),
												(0, react_jsx_runtime.jsx)("span", {
													style: fieldHint,
													children: t("settings.reportTimeHint")
												})
											]
										})]
									}),
									(0, react_jsx_runtime.jsxs)("label", {
										style: inlineCol,
										children: [
											(0, react_jsx_runtime.jsx)("span", {
												style: fieldLabel,
												children: t("settings.reportWindow")
											}),
											(0, react_jsx_runtime.jsxs)("select", {
												style: input,
												value: settings.reportWindow,
												onChange: (event) => patch({ reportWindow: event.target.value }),
												children: [(0, react_jsx_runtime.jsx)("option", {
													value: "calendar",
													children: t("settings.reportWindowCalendar")
												}), (0, react_jsx_runtime.jsx)("option", {
													value: "rolling",
													children: t("settings.reportWindowRolling")
												})]
											}),
											(0, react_jsx_runtime.jsx)("span", {
												style: fieldHint,
												children: t("settings.reportWindowHint")
											})
										]
									}),
									settings.reportFrequency === "weekly" && (0, react_jsx_runtime.jsxs)("label", {
										style: inlineCol,
										children: [(0, react_jsx_runtime.jsx)("span", {
											style: fieldLabel,
											children: t("settings.reportWeekday")
										}), (0, react_jsx_runtime.jsx)("select", {
											style: input,
											value: settings.reportWeekday,
											onChange: (event) => patch({ reportWeekday: Number(event.target.value) }),
											children: t("settings.weekdays").split(",").map((label, idx) => (0, react_jsx_runtime.jsx)("option", {
												value: idx,
												children: label
											}, idx))
										})]
									})
								] }),
								reportStatus !== null && (0, react_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										flexDirection: "column",
										gap: 4
									},
									children: [reportStatus.enabled && reportStatus.nextFireAt !== void 0 && (0, react_jsx_runtime.jsxs)("div", {
										style: fieldHint,
										children: [t("settings.reportNext"), new Date(reportStatus.nextFireAt).toLocaleString()]
									}), reportStatus.last !== void 0 && (0, react_jsx_runtime.jsx)("div", {
										style: reportStatus.last.ok ? fieldHint : {
											...fieldHint,
											color: "#dc2626"
										},
										children: reportStatus.last.ok ? `${t("settings.reportLastSent")}${new Date(reportStatus.last.at).toLocaleString()}` : `${t("settings.reportLastFailed")}${reportStatus.last.error ?? ""}`
									})]
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: onReportNow,
									disabled: reporting,
									style: {
										padding: "4px 8px",
										borderRadius: 6,
										border: "1px solid rgba(0,0,0,0.15)",
										background: "transparent",
										color: "#2563eb",
										fontSize: 12,
										cursor: "pointer",
										alignSelf: "flex-start"
									},
									children: reporting ? t("settings.reportNowPending") : t("settings.reportNow")
								}),
								reportMessage !== null && (0, react_jsx_runtime.jsx)("div", {
									role: "status",
									style: fieldHint,
									children: reportMessage
								})
							]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: EmailCard_module_css_default.footer,
							children: [
								message !== null && (0, react_jsx_runtime.jsx)("span", {
									className: EmailCard_module_css_default.failed,
									role: "status",
									children: message
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: EmailCard_module_css_default.discard,
									onClick: discard,
									disabled: saving,
									children: t("settings.discard")
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: EmailCard_module_css_default.save,
									onClick: onSave,
									disabled: saving,
									children: saving ? t("settings.saving") : t("settings.save")
								})
							]
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
			"settings.prompt": "总结提示词",
			"settings.promptPlaceholder": "自定义提示词",
			"settings.promptHint": "已预填所选样式的默认提示词；改它并保存即成为自定义；点「恢复默认」回到内置默认",
			"settings.restoreDefaultPrompt": "恢复默认提示词",
			"settings.report": "定时发送",
			"settings.reportEnabled": "开启定时日报 / 周报",
			"settings.reportFrequency": "频率",
			"settings.daily": "日报（每天）",
			"settings.weekly": "周报（每周）",
			"settings.reportTime": "发送时间",
			"settings.reportTimeHint": "24 小时制，如 09:00",
			"settings.reportWeekday": "周几",
			"settings.reportWindow": "汇总范围",
			"settings.reportWindowCalendar": "前一个自然日 / 周",
			"settings.reportWindowRolling": "发送前 24 小时 / 7 天",
			"settings.reportWindowHint": "自然日：昨天（周报为上一周）；滚动：从发送时刻往前推",
			"settings.reportHint": "到点自动汇总所选范围内的会话，发给默认收件人",
			"settings.reportNext": "下次发送：",
			"settings.reportLastSent": "上次已发送：",
			"settings.reportLastFailed": "上次失败：",
			"settings.reportNow": "立即发送一次",
			"settings.reportNowPending": "发送中…",
			"settings.reportNowSent": "已发送",
			"settings.reportNowFailed": "发送失败",
			"settings.weekdays": "周日,周一,周二,周三,周四,周五,周六",
			"settings.detailed": "详细",
			"settings.brief": "简短",
			"settings.save": "保存",
			"settings.discard": "放弃",
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
			"settings.prompt": "Summary prompt",
			"settings.promptPlaceholder": "Custom prompt",
			"settings.promptHint": "The default for the selected style is pre-filled; edit and save to customize, or click \"Restore default\" to revert",
			"settings.restoreDefaultPrompt": "Restore default prompt",
			"settings.report": "Scheduled report",
			"settings.reportEnabled": "Enable daily / weekly report",
			"settings.reportFrequency": "Frequency",
			"settings.daily": "Daily",
			"settings.weekly": "Weekly",
			"settings.reportTime": "Send time",
			"settings.reportTimeHint": "24h, e.g. 09:00",
			"settings.reportWeekday": "Weekday",
			"settings.reportWindow": "Summary window",
			"settings.reportWindowCalendar": "Previous day / week",
			"settings.reportWindowRolling": "Last 24h / 7 days",
			"settings.reportWindowHint": "Calendar: yesterday (previous week for weekly); rolling: counted back from the send moment",
			"settings.reportHint": "Automatically summarize sessions in the selected window and email the default recipient",
			"settings.reportNext": "Next send: ",
			"settings.reportLastSent": "Last sent: ",
			"settings.reportLastFailed": "Last failed: ",
			"settings.reportNow": "Send now",
			"settings.reportNowPending": "Sending…",
			"settings.reportNowSent": "Sent",
			"settings.reportNowFailed": "Send failed",
			"settings.weekdays": "Sun,Mon,Tue,Wed,Thu,Fri,Sat",
			"settings.detailed": "Detailed",
			"settings.brief": "Brief",
			"settings.save": "Save",
			"settings.discard": "Discard",
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
				}),
				reportStatus: () => remote.reportStatus().then((result) => result.ok ? result.value : {
					enabled: false,
					frequency: "daily",
					time: "09:00",
					weekday: 1
				}),
				reportNow: () => remote.reportNow().then((result) => result.ok ? result.value : {
					ok: false,
					sent: false,
					count: 0,
					subject: "",
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