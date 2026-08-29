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
/** Start-of-period timestamp: today 00:00, or Monday 00:00 for weekly. */
export declare function reportPeriodStart(frequency: string, now: Date): number;
//# sourceMappingURL=report.d.ts.map