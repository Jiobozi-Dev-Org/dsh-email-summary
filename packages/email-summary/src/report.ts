/**
 * Pure time/schedule helpers for the periodic report.
 * @module @deepseek-ai/dsh-email-summary/src/report
 */

/** Format a Date as `YY年M月D日` (e.g. `26年8月26日`). */
export function formatChineseDate(date: Date): string {
  const year = String(date.getFullYear() % 100)
  const month = String(date.getMonth() + 1)
  const day = String(date.getDate())
  return `${year}年${month}月${day}日`
}

/** Parse `HH:MM` into hours/minutes (defaults to 09:00). */
export function parseReportTime(time: string): { hour: number; minute: number } {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim())
  if (match === null) return { hour: 9, minute: 0 }
  return { hour: Number(match[1]), minute: Number(match[2]) }
}

/** Milliseconds until the next periodic-report occurrence. */
export function msUntilNextReport(
  frequency: string,
  time: string,
  weekday: number,
  now: Date = new Date(),
): number {
  const { hour, minute } = parseReportTime(time)
  const next = new Date(now)
  next.setHours(hour, minute, 0, 0)
  if (frequency === 'weekly') {
    const target = Math.max(0, Math.min(6, weekday))
    let daysAhead = (target - next.getDay() + 7) % 7
    if (daysAhead === 0 && next.getTime() <= now.getTime()) daysAhead = 7
    next.setDate(next.getDate() + daysAhead)
  }
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + (frequency === 'weekly' ? 7 : 1))
  }
  return Math.max(0, next.getTime() - now.getTime())
}

/** One calendar day in milliseconds. */
const DAY_MS = 24 * 60 * 60 * 1000

/** A summary window: inclusive start, exclusive end, epoch ms. */
export interface ReportWindowRange {
  start: number
  end: number
}

/**
 * Compute the session window a periodic report summarizes.
 * - `rolling`: the 24h (daily) or 7 days (weekly) immediately before `now`.
 * - `calendar` (default): the completed previous natural day (yesterday 00:00
 *   → today 00:00), or the previous natural week (last Monday 00:00 → this
 *   Monday 00:00).
 */
export function reportWindowRange(frequency: string, window: string, now: Date = new Date()): ReportWindowRange {
  if (window === 'rolling') {
    const spanMs = (frequency === 'weekly' ? 7 : 1) * DAY_MS
    return { start: now.getTime() - spanMs, end: now.getTime() }
  }
  const end = new Date(now)
  end.setHours(0, 0, 0, 0)
  if (frequency === 'weekly') {
    const sinceMonday = (end.getDay() + 6) % 7
    end.setDate(end.getDate() - sinceMonday) // this Monday 00:00
  }
  const start = new Date(end)
  start.setDate(start.getDate() - (frequency === 'weekly' ? 7 : 1))
  return { start: start.getTime(), end: end.getTime() }
}
