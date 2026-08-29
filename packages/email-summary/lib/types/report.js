/**
 * Pure time/schedule helpers for the periodic report.
 * @module @deepseek-ai/dsh-email-summary/src/report
 */
/** Format a Date as `YY年M月D日` (e.g. `26年8月26日`). */
export function formatChineseDate(date) {
    const year = String(date.getFullYear() % 100);
    const month = String(date.getMonth() + 1);
    const day = String(date.getDate());
    return `${year}年${month}月${day}日`;
}
/** Parse `HH:MM` into hours/minutes (defaults to 09:00). */
export function parseReportTime(time) {
    const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
    if (match === null)
        return { hour: 9, minute: 0 };
    return { hour: Number(match[1]), minute: Number(match[2]) };
}
/** Milliseconds until the next periodic-report occurrence. */
export function msUntilNextReport(frequency, time, weekday, now = new Date()) {
    const { hour, minute } = parseReportTime(time);
    const next = new Date(now);
    next.setHours(hour, minute, 0, 0);
    if (frequency === 'weekly') {
        const target = Math.max(0, Math.min(6, weekday));
        let daysAhead = (target - next.getDay() + 7) % 7;
        if (daysAhead === 0 && next.getTime() <= now.getTime())
            daysAhead = 7;
        next.setDate(next.getDate() + daysAhead);
    }
    if (next.getTime() <= now.getTime()) {
        next.setDate(next.getDate() + (frequency === 'weekly' ? 7 : 1));
    }
    return Math.max(0, next.getTime() - now.getTime());
}
/** Start-of-period timestamp: today 00:00, or Monday 00:00 for weekly. */
export function reportPeriodStart(frequency, now) {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    if (frequency === 'weekly') {
        const sinceMonday = (start.getDay() + 6) % 7;
        start.setDate(start.getDate() - sinceMonday);
    }
    return start.getTime();
}
//# sourceMappingURL=report.js.map