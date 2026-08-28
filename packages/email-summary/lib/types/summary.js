/**
 * Conversation transcript extraction, LLM summarization, and styled HTML email
 * rendering.
 * @module @deepseek-ai/dsh-email-summary/src/summary
 */
import { createUserMessage, BlockAssembler, deepFreeze } from '@deepseek-ai/dsh-llm';
import { deriveEventMessage } from '@deepseek-ai/dsh-session/surface';
/** Concatenate text blocks from one message content. */
function textOfBlocks(blocks) {
    let out = '';
    for (const block of blocks) {
        if (block.type === 'text')
            out += block.text;
    }
    return out;
}
/**
 * Fold surface events into a readable `User:` / `Assistant:` transcript,
 * skipping tool results and non-human injected context.
 */
export function buildTranscript(events) {
    const lines = [];
    let firstUser = '';
    for (const event of events) {
        const message = deriveEventMessage(event);
        if (message == null)
            continue;
        if (message.role === 'user') {
            const kind = message.source?.kind;
            if (kind !== undefined && kind !== 'user')
                continue;
            const text = textOfBlocks(message.content);
            if (text === '')
                continue;
            if (firstUser === '')
                firstUser = text;
            lines.push(`User: ${text}`);
        }
        else if (message.role === 'assistant') {
            const text = textOfBlocks(message.content);
            if (text !== '')
                lines.push(`Assistant: ${text}`);
        }
    }
    return { text: lines.join('\n\n'), firstUser };
}
/** Cap a transcript to `max` chars, keeping the head and tail. */
export function capTranscript(text, max) {
    if (text.length <= max)
        return text;
    const head = text.slice(0, 1500);
    const tail = text.slice(-(max - 1500 - 30));
    return `${head}\n\n…[中间内容已省略]…\n\n${tail}`;
}
/** System instruction for the summarization call. */
function systemPrompt(style) {
    const brief = style === 'brief';
    return [
        '你是专业的对话总结助手。请把下面提供的对话记录总结成结构清晰的内容。',
        '要求：',
        '1. 第一行用一个 Markdown 一级标题（# ）输出简短标题，5~20 字，概括对话主题或成果；',
        '2. 之后用 Markdown 输出正文，建议结构：## 主题、## 关键结论、## 主要要点、## 后续事项；',
        '3. 正文可使用加粗、列表等格式；',
        '4. 用对话原文的主要语言书写（中文为主）；',
        '5. 只输出 Markdown，不要任何额外解释或前后缀。',
        brief ? '请保持简短（约 300 字以内），只保留最重要的结论与待办。' : '请写得完整、准确、结构清晰。',
    ].join('\n');
}
/**
 * Generate one summary through an auxiliary LLM call.
 * @returns the short title and the Markdown body.
 */
export async function generateSummary(llm, provider, model, transcript, style, signal) {
    const messages = [createUserMessage({
            content: [{ type: 'text', text: `以下是需要总结的对话记录：\n\n${transcript}` }],
            source: { kind: 'plugin', plugin: 'dsh-email-summary' },
        })];
    const options = deepFreeze({
        provider,
        model,
        messages,
        system: systemPrompt(style),
        maxTokens: style === 'brief' ? 1000 : 2500,
        ...(signal === undefined ? {} : { signal }),
    });
    const assembler = new BlockAssembler();
    for await (const chunk of llm.stream(options)) {
        assembler.push(chunk);
    }
    const finish = assembler.finish;
    if (finish.kind === 'error' || finish.kind === 'aborted') {
        throw new Error(`总结生成失败：${finish.failure.message}`);
    }
    if (finish.kind === 'tool-calls') {
        throw new Error('总结生成失败：模型意外请求了工具调用');
    }
    const full = assembler.blocks()
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('')
        .trim();
    if (full === '')
        throw new Error('总结生成失败：模型未返回任何文本');
    const lines = full.split('\n');
    const headingIndex = lines.findIndex(line => /^#\s+/.test(line));
    let title = '对话总结';
    let markdown = full;
    if (headingIndex !== -1) {
        const headingLine = lines[headingIndex];
        if (headingLine !== undefined) {
            title = headingLine.replace(/^#+\s*/, '').trim();
            markdown = lines.slice(headingIndex + 1).join('\n').trim();
            if (title === '')
                title = '对话总结';
        }
    }
    return { title, markdown };
}
/** Inline styles shared by the Markdown-to-HTML renderer. */
const STYLES = {
    h2: 'margin:0 0 12px;font-size:18px;color:#1f2329;',
    h3: 'margin:18px 0 8px;font-size:16px;color:#2563eb;border-left:3px solid #2563eb;padding-left:8px;',
    p: 'margin:8px 0;line-height:1.7;color:#333;',
    ul: 'margin:8px 0;padding-left:20px;',
    ol: 'margin:8px 0;padding-left:20px;',
    li: 'margin:4px 0;line-height:1.7;color:#333;',
};
/** Escape HTML text, then inline a few Markdown spans. */
function inline(text) {
    const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    return escaped
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code style="background:#f0f1f3;padding:1px 5px;border-radius:3px;font-family:ui-monospace,Consolas,monospace;">$1</code>');
}
/** Convert a small Markdown body to styled inline-HTML. */
export function markdownToHtml(markdown) {
    const out = [];
    let listType = null;
    const closeList = () => {
        if (listType !== null) {
            out.push(`</${listType}>`);
            listType = null;
        }
    };
    for (const raw of markdown.split('\n')) {
        const line = raw.trimEnd();
        const trimmed = line.trim();
        if (trimmed === '') {
            closeList();
            continue;
        }
        if (/^###\s+/.test(trimmed)) {
            closeList();
            out.push(`<h4 style="${STYLES.h3}">${inline(trimmed.replace(/^###\s+/, ''))}</h4>`);
        }
        else if (/^##\s+/.test(trimmed)) {
            closeList();
            out.push(`<h3 style="${STYLES.h3}">${inline(trimmed.replace(/^##\s+/, ''))}</h3>`);
        }
        else if (/^#\s+/.test(trimmed)) {
            closeList();
            out.push(`<h2 style="${STYLES.h2}">${inline(trimmed.replace(/^#\s+/, ''))}</h2>`);
        }
        else if (/^[-*]\s+/.test(trimmed)) {
            if (listType !== 'ul') {
                closeList();
                out.push(`<ul style="${STYLES.ul}">`);
                listType = 'ul';
            }
            out.push(`<li style="${STYLES.li}">${inline(trimmed.replace(/^[-*]\s+/, ''))}</li>`);
        }
        else if (/^\d+[.)]\s+/.test(trimmed)) {
            if (listType !== 'ol') {
                closeList();
                out.push(`<ol style="${STYLES.ol}">`);
                listType = 'ol';
            }
            out.push(`<li style="${STYLES.li}">${inline(trimmed.replace(/^\d+[.)]\s+/, ''))}</li>`);
        }
        else {
            closeList();
            out.push(`<p style="${STYLES.p}">${inline(trimmed)}</p>`);
        }
    }
    closeList();
    return out.join('');
}
/** Wrap a title + body into a styled standalone HTML email. */
export function buildEmailHtml(title, dateLabel, bodyHtml) {
    return [
        '<!DOCTYPE html><html><head><meta charset="utf-8"></head>',
        '<body style="margin:0;padding:0;background:#f5f6f8;">',
        '<div style="max-width:640px;margin:0 auto;padding:24px;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,\'PingFang SC\',\'Microsoft YaHei\',sans-serif;">',
        '<div style="background:linear-gradient(135deg,#2563eb,#0ea5e9);color:#ffffff;padding:20px 24px;border-radius:12px 12px 0 0;">',
        `<h1 style="margin:0;font-size:20px;font-weight:600;">${inline(title)}</h1>`,
        `<div style="margin-top:6px;font-size:13px;opacity:0.85;">${inline(dateLabel)}</div>`,
        '</div>',
        '<div style="background:#ffffff;padding:20px 24px;border-radius:0 0 12px 12px;font-size:14px;">',
        bodyHtml,
        '</div>',
        '<div style="text-align:center;color:#9aa0a6;font-size:12px;margin-top:16px;">本邮件由 DSH 对话总结自动生成</div>',
        '</div></body></html>',
    ].join('');
}
//# sourceMappingURL=summary.js.map