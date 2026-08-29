/**
 * Pure time/schedule helpers for the periodic report.
 * @module @deepseek-ai/dsh-email-summary/src/report
 */
/** Format a Date as `YY年M月D日` (e.g. `26年8月26日`). */
export declare function formatChineseDate(date: Date): string;
/** Parse `HH:MM` into hours/minutes (defaults to 09:00). */
export declare function parseReportTime(time: string): {
    hour: number;
    minute: number;
};
/** Milliseconds until the next periodic-report occurrence. */
export declare function msUntilNextReport(frequency: string, time: string, weekday: number, now?: Date): number;
/** A summary window: inclusive start, exclusive end, epoch ms. */
export interface ReportWindowRange {
    start: number;
    end: number;
}
/**
 * Compute the session window a periodic report summarizes.
 * - `rolling`: the 24h (daily) or 7 days (weekly) immediately before `now`.
 * - `calendar` (default): the completed previous natural day (yesterday 00:00
 *   → today 00:00), or the previous natural week (last Monday 00:00 → this
 *   Monday 00:00).
 */
export declare function reportWindowRange(frequency: string, window: string, now?: Date): ReportWindowRange;
//# sourceMappingURL=report.d.ts.map