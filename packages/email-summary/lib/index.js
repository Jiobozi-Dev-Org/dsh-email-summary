import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { settingsNamespace } from "@deepseek-ai/dsh-settings";
import { credentialRef } from "@deepseek-ai/dsh-credentials";
import z from "@deepseek-ai/schemastery";
import { execFileSync } from "node:child_process";
import { connect } from "node:net";
import { connect as connect$1 } from "node:tls";
import { BlockAssembler, createUserMessage, deepFreeze } from "@deepseek-ai/dsh-llm";
import { deriveEventMessage } from "@deepseek-ai/dsh-session/surface";
//#region lib/types/spec.js
/**
* Durable settings namespace, schema, and provider presets for email-summary.
* @module @deepseek-ai/dsh-email-summary/src/spec
*/
/** Durable settings namespace for SMTP + summary preferences. */
const EMAIL_SUMMARY_SETTINGS_NAMESPACE = "email-summary";
/** Defaults applied when the namespace has not been written yet. */
const DEFAULT_EMAIL_SETTINGS = {
	provider: "qq",
	smtpHost: "smtp.qq.com",
	smtpPort: 465,
	secure: "ssl",
	username: "",
	from: "",
	defaultRecipient: "",
	style: "detailed",
	prompt: ""
};
/** Settings schema (strings/numbers only; enums validated at read time). */
const EmailSummarySettingsSchema = z.object({
	provider: z.string(),
	smtpHost: z.string(),
	smtpPort: z.number(),
	secure: z.string(),
	username: z.string(),
	from: z.string(),
	defaultRecipient: z.string(),
	style: z.string(),
	prompt: z.string()
});
/** SMTP provider presets: Gmail / QQ / 163 / 126 / Outlook + custom. */
const EMAIL_PROVIDER_PRESETS = Object.freeze([
	Object.freeze({
		id: "gmail",
		label: "Gmail",
		host: "smtp.gmail.com",
		port: 587,
		secure: "starttls"
	}),
	Object.freeze({
		id: "qq",
		label: "QQ 邮箱",
		host: "smtp.qq.com",
		port: 465,
		secure: "ssl"
	}),
	Object.freeze({
		id: "163",
		label: "163 邮箱",
		host: "smtp.163.com",
		port: 465,
		secure: "ssl"
	}),
	Object.freeze({
		id: "126",
		label: "126 邮箱",
		host: "smtp.126.com",
		port: 465,
		secure: "ssl"
	}),
	Object.freeze({
		id: "outlook",
		label: "Outlook / 365",
		host: "smtp.office365.com",
		port: 587,
		secure: "starttls"
	}),
	Object.freeze({
		id: "custom",
		label: "自定义",
		host: "",
		port: 587,
		secure: "starttls"
	})
]);
/** Look up one preset by id; `undefined` when unknown. */
function presetById(id) {
	return EMAIL_PROVIDER_PRESETS.find((preset) => preset.id === id);
}
//#endregion
//#region lib/types/smtp.js
/**
* Minimal, dependency-free SMTP client over `node:net`/`node:tls`.
* Supports implicit SSL (465), STARTTLS (587), and no-TLS (25), with
* AUTH PLAIN authentication and UTF-8 (base64) message bodies. Outbound
* connections honor an HTTP/SOCKS5 proxy from `HTTPS_PROXY`/`HTTP_PROXY`/
* `ALL_PROXY` environment variables, falling back to the Windows system
* proxy, so a local Clash/V2Ray tunnel can reach blocked SMTP hosts.
* @module @deepseek-ai/dsh-email-summary/src/smtp
*/
/** Connect-phase inactivity timeout (cleared once the SMTP greeting arrives). */
const CONNECT_TIMEOUT_MS = 2e4;
/** One SMTP session: a command/response request-response layer over a socket. */
var SmtpSession = class {
	conn;
	buffer = "";
	pending;
	failed;
	constructor(conn) {
		this.conn = conn;
		this.attach();
	}
	/** The underlying socket (used to upgrade STARTTLS in place). */
	get socket() {
		return this.conn;
	}
	onData = (chunk) => {
		this.feed(chunk);
	};
	onError = (error) => {
		this.settle(/* @__PURE__ */ new Error(`SMTP socket error: ${error.message}`));
	};
	onClose = () => {
		this.settle(/* @__PURE__ */ new Error("SMTP connection closed unexpectedly"));
	};
	attach() {
		this.conn.setEncoding("utf8");
		this.conn.on("data", this.onData);
		this.conn.on("error", this.onError);
		this.conn.on("close", this.onClose);
	}
	/** Remove this session's listeners (before wrapping the socket in TLS). */
	detach() {
		this.conn.off("data", this.onData);
		this.conn.off("error", this.onError);
		this.conn.off("close", this.onClose);
	}
	settle(error) {
		if (this.failed === void 0) this.failed = error;
		if (this.pending !== void 0) {
			const pending = this.pending;
			this.pending = void 0;
			pending.reject(error);
		}
	}
	/** Feed already-received bytes (e.g. leftover after a proxy tunnel handshake). */
	feed(chunk) {
		this.buffer += chunk;
		while (true) {
			const nl = this.buffer.indexOf("\n");
			if (nl === -1) return;
			const line = this.buffer.slice(0, nl).replace(/\r$/, "");
			this.buffer = this.buffer.slice(nl + 1);
			if (this.pending === void 0) continue;
			if (!(line.length >= 4 && line[3] === " " && line.slice(0, 3) === String(this.pending.code))) continue;
			const pending = this.pending;
			this.pending = void 0;
			pending.resolve(line);
		}
	}
	/** Send one command and await its expected reply code. */
	command(line, code) {
		if (this.failed !== void 0) return Promise.reject(this.failed);
		return new Promise((resolve, reject) => {
			this.pending = {
				code,
				resolve,
				reject
			};
			this.conn.write(`${line}\r\n`);
		});
	}
	/** Await the next reply with a given code (no command written). */
	awaitReply(code) {
		if (this.failed !== void 0) return Promise.reject(this.failed);
		return new Promise((resolve, reject) => {
			this.pending = {
				code,
				resolve,
				reject
			};
		});
	}
	end() {
		try {
			this.conn.end();
		} catch {}
	}
};
/** Parse a proxy URL / `host:port` string. */
function parseProxy(value) {
	let s = value.trim();
	if (s === "") return void 0;
	let scheme = "http";
	if (/^socks5?:\/\//i.test(s)) {
		scheme = "socks5";
		s = s.replace(/^socks5?:\/\//i, "");
	} else if (/^https?:\/\//i.test(s)) {
		scheme = "http";
		s = s.replace(/^https?:\/\//i, "");
	}
	s = s.replace(/^[^@/]+@/, "");
	const colon = s.indexOf(":");
	const host = colon === -1 ? s : s.slice(0, colon);
	const port = Number(colon === -1 ? "80" : s.slice(colon + 1));
	if (host === "" || !Number.isFinite(port)) return void 0;
	return {
		host,
		port,
		scheme
	};
}
/** Resolve an outbound proxy from env vars, then the Windows system proxy. */
function resolveProxy() {
	const envUrl = process.env.HTTPS_PROXY ?? process.env.https_proxy ?? process.env.HTTP_PROXY ?? process.env.http_proxy ?? process.env.ALL_PROXY ?? process.env.all_proxy;
	if (envUrl !== void 0) return parseProxy(envUrl);
	if (process.platform === "win32") try {
		const match = execFileSync("reg", [
			"query",
			"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings",
			"/v",
			"ProxyServer"
		], {
			encoding: "utf8",
			windowsHide: true,
			stdio: [
				"ignore",
				"pipe",
				"ignore"
			]
		}).match(/ProxyServer\s+REG_SZ\s+(.+?)\s*$/m);
		if (match !== null) {
			const value = match[1];
			if (value === void 0) return void 0;
			const first = (value.split(";")[0] ?? "").trim();
			const eq = first.indexOf("=");
			return parseProxy(eq === -1 ? first : first.slice(eq + 1).trim());
		}
	} catch {}
}
/** HTTP CONNECT tunnel; resolves with bytes received after the handshake. */
function httpConnect(sock, host, port) {
	return new Promise((resolve, reject) => {
		let buf = "";
		const onError = (error) => {
			cleanup();
			reject(error);
		};
		const onData = (chunk) => {
			buf += chunk.toString("latin1");
			const idx = buf.indexOf("\r\n\r\n");
			if (idx === -1) return;
			cleanup();
			const statusLine = buf.slice(0, buf.indexOf("\r\n"));
			if (statusLine.split(" ")[1] === "200") resolve(buf.slice(idx + 4));
			else reject(/* @__PURE__ */ new Error(`代理 CONNECT 失败：${statusLine}`));
		};
		const cleanup = () => {
			sock.off("data", onData);
			sock.off("error", onError);
		};
		sock.on("data", onData);
		sock.on("error", onError);
		sock.write(`CONNECT ${host}:${port} HTTP/1.1\r\nHost: ${host}:${port}\r\n\r\n`);
	});
}
/** SOCKS5 (no-auth) tunnel; resolves with bytes received after the handshake. */
function socks5Connect(sock, host, port) {
	return new Promise((resolve, reject) => {
		let buf = Buffer.alloc(0);
		let greetingDone = false;
		const onError = (error) => {
			cleanup();
			reject(error);
		};
		const onData = (chunk) => {
			buf = Buffer.concat([buf, chunk]);
			if (!greetingDone && buf.length >= 2) {
				if (buf[0] !== 5 || buf[1] !== 0) {
					cleanup();
					reject(/* @__PURE__ */ new Error("SOCKS5 代理不支持无认证"));
					return;
				}
				buf = buf.slice(2);
				greetingDone = true;
				const domain = Buffer.from(host, "utf8");
				const head = Buffer.from([
					5,
					1,
					0,
					3,
					domain.length
				]);
				const portBuf = Buffer.alloc(2);
				portBuf.writeUInt16BE(port, 0);
				sock.write(Buffer.concat([
					head,
					domain,
					portBuf
				]));
			}
			if (greetingDone && buf.length >= 4) {
				const atyp = buf[3];
				let addrLen = 0;
				if (atyp === 1) addrLen = 4;
				else if (atyp === 4) addrLen = 16;
				else if (atyp === 3) addrLen = buf[4] ?? 0;
				const fullLen = 6 + addrLen;
				if (buf.length < fullLen) return;
				cleanup();
				const rep = buf[1];
				if (rep !== 0) {
					reject(/* @__PURE__ */ new Error(`SOCKS5 连接失败，错误码 ${rep}`));
					return;
				}
				resolve(buf.slice(fullLen).toString("latin1"));
			}
		};
		const cleanup = () => {
			sock.off("data", onData);
			sock.off("error", onError);
		};
		sock.on("data", onData);
		sock.on("error", onError);
		sock.write(Buffer.from([
			5,
			1,
			0
		]));
	});
}
/** Open a raw socket to the SMTP host, directly or through a proxy. */
async function openRawSocket(host, port) {
	const proxy = resolveProxy();
	if (proxy === void 0) return {
		socket: connect({
			host,
			port
		}),
		leftover: ""
	};
	const sock = connect({
		host: proxy.host,
		port: proxy.port
	});
	return {
		socket: sock,
		leftover: proxy.scheme === "socks5" ? await socks5Connect(sock, host, port) : await httpConnect(sock, host, port)
	};
}
/** Encode text as base64 (Node Buffer, host-only). */
function b64(value) {
	return Buffer.from(value, "utf8").toString("base64");
}
/** RFC 2047 encode a header value when it is not pure ASCII. */
function encodeHeader(value) {
	if (/^[\x20-\x7e]*$/.test(value)) return value;
	return `=?utf-8?B?${b64(value)}?=`;
}
/** Build the raw message (headers + base64 body) handed to the DATA command. */
function buildMessage(mail) {
	return [
		`From: <${mail.from}>`,
		`To: <${mail.to}>`,
		`Subject: ${encodeHeader(mail.subject)}`,
		"MIME-Version: 1.0",
		"Content-Type: text/html; charset=utf-8",
		"Content-Transfer-Encoding: base64",
		""
	].join("\r\n") + b64(mail.html).replace(/(.{76})/g, "$1\r\n").replace(/\r\n$/, "") + "\r\n";
}
/** Send one email over SMTP. */
async function sendSmtpMail(mail) {
	const { socket: raw, leftover } = await openRawSocket(mail.host, mail.port);
	raw.setTimeout(CONNECT_TIMEOUT_MS, () => {
		raw.destroy(/* @__PURE__ */ new Error(`连接 ${mail.host}:${mail.port} 超时（${CONNECT_TIMEOUT_MS / 1e3}s），请检查网络/代理`));
	});
	let session = mail.secure === "ssl" ? new SmtpSession(connect$1({
		socket: raw,
		servername: mail.host
	})) : new SmtpSession(raw);
	try {
		if (leftover !== "") session.feed(leftover);
		await session.awaitReply(220);
		raw.setTimeout(0);
		await session.command(`EHLO ${mail.host}`, 250);
		if (mail.secure === "starttls") {
			await session.command("STARTTLS", 220);
			const plain = session.socket;
			session.detach();
			session = new SmtpSession(connect$1({
				socket: plain,
				servername: mail.host
			}));
			await session.command(`EHLO ${mail.host}`, 250);
		}
		if (mail.username !== "") {
			await session.command("AUTH PLAIN", 334);
			await session.command(b64(`\u0000${mail.username}\u0000${mail.password}`), 235);
		}
		await session.command(`MAIL FROM:<${mail.from}>`, 250);
		await session.command(`RCPT TO:<${mail.to}>`, 250);
		await session.command("DATA", 354);
		await session.command(`${buildMessage(mail)}.`, 250);
		await session.command("QUIT", 221);
	} finally {
		session.end();
	}
}
//#endregion
//#region lib/types/summary.js
/**
* Conversation transcript extraction, LLM summarization, and styled HTML email
* rendering.
* @module @deepseek-ai/dsh-email-summary/src/summary
*/
/** Concatenate text blocks from one message content. */
function textOfBlocks(blocks) {
	let out = "";
	for (const block of blocks) if (block.type === "text") out += block.text;
	return out;
}
/**
* Fold surface events into a readable `User:` / `Assistant:` transcript,
* skipping tool results and non-human injected context.
*/
function buildTranscript(events) {
	const lines = [];
	let firstUser = "";
	for (const event of events) {
		const message = deriveEventMessage(event);
		if (message == null) continue;
		if (message.role === "user") {
			const kind = message.source?.kind;
			if (kind !== void 0 && kind !== "user") continue;
			const text = textOfBlocks(message.content);
			if (text === "") continue;
			if (firstUser === "") firstUser = text;
			lines.push(`User: ${text}`);
		} else if (message.role === "assistant") {
			const text = textOfBlocks(message.content);
			if (text !== "") lines.push(`Assistant: ${text}`);
		}
	}
	return {
		text: lines.join("\n\n"),
		firstUser
	};
}
/** Cap a transcript to `max` chars, keeping the head and tail. */
function capTranscript(text, max) {
	if (text.length <= max) return text;
	return `${text.slice(0, 1500)}\n\n…[中间内容已省略]…\n\n${text.slice(-(max - 1500 - 30))}`;
}
/** Default system instruction for the summarization call. */
function defaultSystemPrompt(style) {
	return [
		"你是专业的对话总结助手。请把下面提供的对话记录总结成结构清晰的内容。",
		"要求：",
		"1. 第一行用一个 Markdown 一级标题（# ）输出简短标题，5~20 字，概括对话主题或成果；",
		"2. 之后用 Markdown 输出正文，建议结构：## 主题、## 关键结论、## 主要要点、## 后续事项；",
		"3. 正文可使用加粗、列表等格式；",
		"4. 用对话原文的主要语言书写（中文为主）；",
		"5. 只输出 Markdown，不要任何额外解释或前后缀。",
		style === "brief" ? "请保持简短（约 300 字以内），只保留最重要的结论与待办。" : "请写得完整、准确、结构清晰。"
	].join("\n");
}
/**
* Generate one summary through an auxiliary LLM call.
* @returns the short title and the Markdown body.
*/
async function generateSummary(llm, provider, model, transcript, style, customPrompt, signal) {
	const options = deepFreeze({
		provider,
		model,
		messages: [createUserMessage({
			content: [{
				type: "text",
				text: `以下是需要总结的对话记录：\n\n${transcript}`
			}],
			source: {
				kind: "plugin",
				plugin: "dsh-email-summary"
			}
		})],
		system: customPrompt !== void 0 && customPrompt.trim() !== "" ? customPrompt.trim() : defaultSystemPrompt(style),
		maxTokens: style === "brief" ? 1e3 : 2500,
		...signal === void 0 ? {} : { signal }
	});
	const assembler = new BlockAssembler();
	for await (const chunk of llm.stream(options)) assembler.push(chunk);
	const finish = assembler.finish;
	if (finish.kind === "error" || finish.kind === "aborted") throw new Error(`总结生成失败：${finish.failure.message}`);
	if (finish.kind === "tool-calls") throw new Error("总结生成失败：模型意外请求了工具调用");
	const full = assembler.blocks().filter((block) => block.type === "text").map((block) => block.text).join("").trim();
	if (full === "") throw new Error("总结生成失败：模型未返回任何文本");
	const lines = full.split("\n");
	const headingIndex = lines.findIndex((line) => /^#\s+/.test(line));
	let title = "对话总结";
	let markdown = full;
	if (headingIndex !== -1) {
		const headingLine = lines[headingIndex];
		if (headingLine !== void 0) {
			title = headingLine.replace(/^#+\s*/, "").trim();
			markdown = lines.slice(headingIndex + 1).join("\n").trim();
			if (title === "") title = "对话总结";
		}
	}
	return {
		title,
		markdown
	};
}
/** Inline styles shared by the Markdown-to-HTML renderer. */
const STYLES = {
	h2: "margin:0 0 12px;font-size:18px;color:#1f2329;",
	h3: "margin:18px 0 8px;font-size:16px;color:#2563eb;border-left:3px solid #2563eb;padding-left:8px;",
	p: "margin:8px 0;line-height:1.7;color:#333;",
	ul: "margin:8px 0;padding-left:20px;",
	ol: "margin:8px 0;padding-left:20px;",
	li: "margin:4px 0;line-height:1.7;color:#333;"
};
/** Escape HTML text, then inline a few Markdown spans. */
function inline(text) {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "<code style=\"background:#f0f1f3;padding:1px 5px;border-radius:3px;font-family:ui-monospace,Consolas,monospace;\">$1</code>");
}
/** Convert a small Markdown body to styled inline-HTML. */
function markdownToHtml(markdown) {
	const out = [];
	let listType = null;
	const closeList = () => {
		if (listType !== null) {
			out.push(`</${listType}>`);
			listType = null;
		}
	};
	for (const raw of markdown.split("\n")) {
		const trimmed = raw.trimEnd().trim();
		if (trimmed === "") {
			closeList();
			continue;
		}
		if (/^###\s+/.test(trimmed)) {
			closeList();
			out.push(`<h4 style="${STYLES.h3}">${inline(trimmed.replace(/^###\s+/, ""))}</h4>`);
		} else if (/^##\s+/.test(trimmed)) {
			closeList();
			out.push(`<h3 style="${STYLES.h3}">${inline(trimmed.replace(/^##\s+/, ""))}</h3>`);
		} else if (/^#\s+/.test(trimmed)) {
			closeList();
			out.push(`<h2 style="${STYLES.h2}">${inline(trimmed.replace(/^#\s+/, ""))}</h2>`);
		} else if (/^[-*]\s+/.test(trimmed)) {
			if (listType !== "ul") {
				closeList();
				out.push(`<ul style="${STYLES.ul}">`);
				listType = "ul";
			}
			out.push(`<li style="${STYLES.li}">${inline(trimmed.replace(/^[-*]\s+/, ""))}</li>`);
		} else if (/^\d+[.)]\s+/.test(trimmed)) {
			if (listType !== "ol") {
				closeList();
				out.push(`<ol style="${STYLES.ol}">`);
				listType = "ol";
			}
			out.push(`<li style="${STYLES.li}">${inline(trimmed.replace(/^\d+[.)]\s+/, ""))}</li>`);
		} else {
			closeList();
			out.push(`<p style="${STYLES.p}">${inline(trimmed)}</p>`);
		}
	}
	closeList();
	return out.join("");
}
/** Wrap a title + body into a styled standalone HTML email. */
function buildEmailHtml(title, dateLabel, bodyHtml) {
	return [
		"<!DOCTYPE html><html><head><meta charset=\"utf-8\"></head>",
		"<body style=\"margin:0;padding:0;background:#f5f6f8;\">",
		"<div style=\"max-width:640px;margin:0 auto;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'PingFang SC','Microsoft YaHei',sans-serif;\">",
		"<div style=\"background:linear-gradient(135deg,#2563eb,#0ea5e9);color:#ffffff;padding:20px 24px;border-radius:12px 12px 0 0;\">",
		`<h1 style="margin:0;font-size:20px;font-weight:600;">${inline(title)}</h1>`,
		`<div style="margin-top:6px;font-size:13px;opacity:0.85;">${inline(dateLabel)}</div>`,
		"</div>",
		"<div style=\"background:#ffffff;padding:20px 24px;border-radius:0 0 12px 12px;font-size:14px;\">",
		bodyHtml,
		"</div>",
		"<div style=\"text-align:center;color:#9aa0a6;font-size:12px;margin-top:16px;\">本邮件由 DSH 对话总结自动生成</div>",
		"</div></body></html>"
	].join("");
}
//#endregion
//#region lib/types/index.js
/**
* Host service: summarize a conversation and email it over SMTP, with a
* durable settings namespace, a credential-backed password, per-session
* auto-send arming, and a generated Client Remote (`remote.emailSummary`).
* @module @deepseek-ai/dsh-email-summary
*/
var __runInitializers = function(thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	function accept(f) {
		if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
		return f;
	}
	var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
	var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
	var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	var _, done = false;
	for (var i = decorators.length - 1; i >= 0; i--) {
		var context = {};
		for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
		for (var p in contextIn.access) context.access[p] = contextIn.access[p];
		context.addInitializer = function(f) {
			if (done) throw new TypeError("Cannot add initializers after decoration has completed");
			extraInitializers.push(accept(f || null));
		};
		var result = (0, decorators[i])(kind === "accessor" ? {
			get: descriptor.get,
			set: descriptor.set
		} : descriptor[key], context);
		if (kind === "accessor") {
			if (result === void 0) continue;
			if (result === null || typeof result !== "object") throw new TypeError("Object expected");
			if (_ = accept(result.get)) descriptor.get = _;
			if (_ = accept(result.set)) descriptor.set = _;
			if (_ = accept(result.init)) initializers.unshift(_);
		} else if (_ = accept(result)) if (kind === "field") initializers.unshift(_);
		else descriptor[key] = _;
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
/** Environment-variable name for the SMTP password. */
const SMTP_PASSWORD_ENV = "EMAIL_SMTP_PASSWORD";
/** Format a Date as `YY年M月D日` (e.g. `26年8月26日`). */
function formatChineseDate(date) {
	return `${String(date.getFullYear() % 100)}年${String(date.getMonth() + 1)}月${String(date.getDate())}日`;
}
/** Host service for conversation summarization + SMTP delivery. */
let EmailSummaryService = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _sendNow_decorators;
	let _armAutosend_decorators;
	let _status_decorators;
	let _getSettings_decorators;
	let _saveSettings_decorators;
	let _setPassword_decorators;
	return class EmailSummaryService extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_sendNow_decorators = [Remote("sendNow")];
			_armAutosend_decorators = [Remote("armAutosend")];
			_status_decorators = [Remote("status")];
			_getSettings_decorators = [Remote("getSettings")];
			_saveSettings_decorators = [Remote("saveSettings")];
			_setPassword_decorators = [Remote("setPassword")];
			__esDecorate(this, null, _sendNow_decorators, {
				kind: "method",
				name: "sendNow",
				static: false,
				private: false,
				access: {
					has: (obj) => "sendNow" in obj,
					get: (obj) => obj.sendNow
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _armAutosend_decorators, {
				kind: "method",
				name: "armAutosend",
				static: false,
				private: false,
				access: {
					has: (obj) => "armAutosend" in obj,
					get: (obj) => obj.armAutosend
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _status_decorators, {
				kind: "method",
				name: "status",
				static: false,
				private: false,
				access: {
					has: (obj) => "status" in obj,
					get: (obj) => obj.status
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _getSettings_decorators, {
				kind: "method",
				name: "getSettings",
				static: false,
				private: false,
				access: {
					has: (obj) => "getSettings" in obj,
					get: (obj) => obj.getSettings
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _saveSettings_decorators, {
				kind: "method",
				name: "saveSettings",
				static: false,
				private: false,
				access: {
					has: (obj) => "saveSettings" in obj,
					get: (obj) => obj.saveSettings
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _setPassword_decorators, {
				kind: "method",
				name: "setPassword",
				static: false,
				private: false,
				access: {
					has: (obj) => "setPassword" in obj,
					get: (obj) => obj.setPassword
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			if (_metadata) Object.defineProperty(this, Symbol.metadata, {
				enumerable: true,
				configurable: true,
				writable: true,
				value: _metadata
			});
		}
		static inject = [
			"llm",
			"sessionQuery",
			"settings",
			"credentials",
			"agentDefaultModel"
		];
		/** Session ids currently armed for auto-send, with an optional recipient override. */
		armed = (__runInitializers(this, _instanceExtraInitializers), /* @__PURE__ */ new Map());
		/** The durable settings scope (structural type; matches `SettingsScope<T>`). */
		settingsScope;
		constructor(ctx) {
			super(ctx, "emailSummary");
			this.settingsScope = ctx.settings.register(settingsNamespace(EMAIL_SUMMARY_SETTINGS_NAMESPACE), EmailSummarySettingsSchema, { base: DEFAULT_EMAIL_SETTINGS });
			ctx.on("agent/status", (payload) => {
				if (payload.status !== "idle") return;
				const recipient = this.armed.get(payload.agent.id);
				if (recipient === void 0 && !this.armed.has(payload.agent.id)) return;
				this.armed.delete(payload.agent.id);
				this.summarizeAndSend(payload.agent.id, recipient, void 0, void 0).catch(() => {});
			});
		}
		/** Resolve effective mail configuration from settings + the credential password. */
		async resolveMail() {
			const raw = this.settingsScope.get() ?? DEFAULT_EMAIL_SETTINGS;
			const preset = presetById(raw.provider);
			const host = preset !== void 0 ? preset.host : raw.smtpHost;
			const port = preset !== void 0 ? preset.port : raw.smtpPort;
			const secure = preset !== void 0 ? preset.secure : raw.secure;
			const password = (await this.ctx.credentials.resolve(credentialRef(SMTP_PASSWORD_ENV)))?.value ?? "";
			const from = raw.from !== "" ? raw.from : raw.username;
			return {
				host,
				port,
				secure,
				username: raw.username,
				password,
				from,
				style: raw.style === "brief" ? "brief" : "detailed",
				defaultRecipient: raw.defaultRecipient,
				prompt: raw.prompt
			};
		}
		/** Summarize one session and send it; throws on failure. */
		async summarizeAndSend(sessionId, recipient, subject, style) {
			const mail = await this.resolveMail();
			const to = recipient && recipient !== "" ? recipient : mail.defaultRecipient;
			if (to === "") throw new Error("未配置收件人：请在设置里填写默认收件人，或点击按钮时指定收件人。");
			if (mail.host === "") throw new Error("未配置 SMTP 主机：请在设置里选择邮箱预设或填写自定义主机。");
			if (mail.from === "") throw new Error("未配置发件人：请在设置里填写发件人邮箱。");
			const transcript = buildTranscript((await this.ctx.sessionQuery.readSurface(sessionId)).events);
			if (transcript.text.trim() === "") throw new Error("当前会话没有可总结的对话内容。");
			const selection = this.ctx.agentDefaultModel.currentSelection();
			if (selection === void 0 || selection.provider === "" || selection.model === "") throw new Error("无法解析可用的 LLM 模型（provider/model）。");
			const summary = await generateSummary(this.ctx.llm, selection.provider, selection.model, capTranscript(transcript.text, 2e4), style ?? mail.style, mail.prompt);
			const dateLabel = formatChineseDate(/* @__PURE__ */ new Date());
			const resolvedSubject = subject && subject !== "" ? subject : `${dateLabel}dsh开发笔记：${summary.title}`;
			const html = buildEmailHtml(summary.title, dateLabel, markdownToHtml(summary.markdown));
			await sendSmtpMail({
				host: mail.host,
				port: mail.port,
				secure: mail.secure,
				username: mail.username,
				password: mail.password,
				from: mail.from,
				to,
				subject: resolvedSubject,
				html
			});
			return {
				ok: true,
				recipient: to,
				subject: resolvedSubject,
				summaryChars: summary.markdown.length,
				transcriptChars: transcript.text.length,
				summary: summary.markdown
			};
		}
		/** Summarize the current conversation and email it now. */
		async sendNow(request) {
			try {
				return await this.summarizeAndSend(request.sessionId, request.recipient, request.subject, request.style);
			} catch (error) {
				return {
					ok: false,
					recipient: request.recipient ?? "",
					subject: request.subject ?? "",
					summaryChars: 0,
					transcriptChars: 0,
					error: error instanceof Error ? error.message : String(error)
				};
			}
		}
		/** Arm or disarm auto-send for one conversation. */
		armAutosend(request) {
			if (request.enabled) this.armed.set(request.sessionId, request.recipient && request.recipient !== "" ? request.recipient : void 0);
			else this.armed.delete(request.sessionId);
			return {
				ok: true,
				armed: this.armed.has(request.sessionId)
			};
		}
		/** Read configuration + armed state for the settings surface and toggles. */
		async status(request) {
			const mail = await this.resolveMail();
			return {
				configured: mail.host !== "" && mail.from !== "",
				defaultRecipient: mail.defaultRecipient,
				armed: this.armed.has(request.sessionId),
				presets: [...EMAIL_PROVIDER_PRESETS]
			};
		}
		/** Read the raw persisted settings (the surface edits these). */
		async getSettings() {
			const raw = this.settingsScope.get() ?? DEFAULT_EMAIL_SETTINGS;
			const mail = await this.resolveMail();
			return {
				settings: raw,
				presets: [...EMAIL_PROVIDER_PRESETS],
				configured: mail.host !== "" && mail.from !== "",
				defaultPrompt: defaultSystemPrompt(raw.style === "brief" ? "brief" : "detailed")
			};
		}
		/** Persist a partial settings patch. */
		async saveSettings(request) {
			try {
				await this.ctx.settings.update(settingsNamespace(EMAIL_SUMMARY_SETTINGS_NAMESPACE), request.patch);
				return { ok: true };
			} catch (error) {
				return {
					ok: false,
					error: error instanceof Error ? error.message : String(error)
				};
			}
		}
		/** Store (or clear) the SMTP password through the credential seam. */
		async setPassword(request) {
			try {
				const ref = credentialRef(SMTP_PASSWORD_ENV);
				if (request.password === "") await this.ctx.credentials.unset(ref);
				else await this.ctx.credentials.set(ref, request.password);
				return { ok: true };
			} catch (error) {
				return {
					ok: false,
					error: error instanceof Error ? error.message : String(error)
				};
			}
		}
	};
})();
//#endregion
export { DEFAULT_EMAIL_SETTINGS, EMAIL_PROVIDER_PRESETS, EMAIL_SUMMARY_SETTINGS_NAMESPACE, EmailSummaryService, EmailSummaryService as default };
