/**
 * Conversation transcript extraction, LLM summarization, and styled HTML email
 * rendering.
 * @module @jiobozi-dev-org/dsh-email-summary/src/summary
 */
import type { GenerateOptions, StreamChunk } from '@deepseek-ai/dsh-llm';
import type { SessionEvent } from '@deepseek-ai/dsh-session/types';
import type { EmailSummaryStyle } from './types.ts';
/** Extracted conversation transcript. */
export interface Transcript {
    text: string;
}
/** Inclusive-start, exclusive-end time window an event must fall inside. */
export interface TranscriptRange {
    start: number;
    end: number;
}
/**
 * Fold surface events into a readable `User:` / `Assistant:` transcript,
 * skipping tool results and non-human injected context. When `range` is given,
 * only messages whose event time falls inside it are folded — used by the
 * periodic report to summarize a window's activity instead of the whole log.
 */
export declare function buildTranscript(events: readonly SessionEvent[], range?: TranscriptRange): Transcript;
/** Cap a transcript to `max` chars, keeping the head and tail. */
export declare function capTranscript(text: string, max: number): string;
/** Default system instruction for the summarization call. */
export declare function defaultSystemPrompt(style: EmailSummaryStyle): string;
/** Minimal stream-capable LLM face accepted by the summarizer. */
export interface SummaryLlm {
    stream(options: GenerateOptions): AsyncIterable<StreamChunk>;
}
/** A generated summary: a short title plus the Markdown body. */
export interface SummaryResult {
    title: string;
    markdown: string;
}
/**
 * Generate one summary through an auxiliary LLM call.
 * @returns the short title and the Markdown body.
 */
export declare function generateSummary(llm: SummaryLlm, provider: string, model: string, transcript: string, style: EmailSummaryStyle, customPrompt?: string, signal?: AbortSignal): Promise<SummaryResult>;
/** Convert a small Markdown body to styled inline-HTML. */
export declare function markdownToHtml(markdown: string): string;
/** Wrap a title + body into a styled standalone HTML email. */
export declare function buildEmailHtml(title: string, dateLabel: string, bodyHtml: string): string;
//# sourceMappingURL=summary.d.ts.map