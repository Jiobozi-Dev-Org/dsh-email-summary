import { describe, expect, it } from 'vitest'
import {
  formatChineseDate,
  msUntilNextReport,
  parseReportTime,
  reportWindowRange,
} from '../src/report.ts'

const HOUR = 3600000
const DAY = 86400000

describe('formatChineseDate', () => {
  it('formats as YY年M月D日', () => {
    expect(formatChineseDate(new Date(2026, 7, 26))).toBe('26年8月26日')
  })
})

describe('parseReportTime', () => {
  it('parses HH:MM', () => {
    expect(parseReportTime('09:00')).toEqual({ hour: 9, minute: 0 })
    expect(parseReportTime('23:30')).toEqual({ hour: 23, minute: 30 })
  })

  it('falls back to 09:00 on malformed input', () => {
    expect(parseReportTime('not-a-time')).toEqual({ hour: 9, minute: 0 })
  })
})

describe('msUntilNextReport (daily)', () => {
  it('a future time stays today', () => {
    const now = new Date(2026, 0, 7, 8, 0, 0)
    expect(msUntilNextReport('daily', '09:00', 1, now)).toBe(HOUR)
  })

  it('a past time rolls to tomorrow', () => {
    const now = new Date(2026, 0, 7, 10, 0, 0)
    expect(msUntilNextReport('daily', '09:00', 1, now)).toBe(23 * HOUR)
  })
})

describe('msUntilNextReport (weekly)', () => {
  it('a future time on the target weekday stays today', () => {
    const now = new Date(2026, 0, 7, 8, 0, 0)
    expect(msUntilNextReport('weekly', '09:00', now.getDay(), now)).toBe(HOUR)
  })

  it('a past time on the target weekday rolls to next week', () => {
    const now = new Date(2026, 0, 7, 10, 0, 0)
    expect(msUntilNextReport('weekly', '09:00', now.getDay(), now)).toBe(6 * DAY + 23 * HOUR)
  })
})

describe('reportWindowRange (daily)', () => {
  it('calendar spans yesterday 00:00 → today 00:00', () => {
    const now = new Date(2026, 0, 7, 15, 30, 0) // Wed
    const range = reportWindowRange('daily', 'calendar', now)
    expect(range.start).toBe(new Date(2026, 0, 6).getTime())
    expect(range.end).toBe(new Date(2026, 0, 7).getTime())
  })

  it('rolling spans the 24h before now', () => {
    const now = new Date(2026, 0, 7, 15, 30, 0)
    const range = reportWindowRange('daily', 'rolling', now)
    expect(range.start).toBe(now.getTime() - DAY)
    expect(range.end).toBe(now.getTime())
  })
})

describe('reportWindowRange (weekly)', () => {
  it('calendar spans last Monday 00:00 → this Monday 00:00', () => {
    const now = new Date(2026, 0, 7, 15, 30, 0) // Wed
    const range = reportWindowRange('weekly', 'calendar', now)
    expect(new Date(range.start).getDay()).toBe(1) // Monday
    expect(new Date(range.end).getDay()).toBe(1) // Monday
    expect(range.end - range.start).toBe(7 * DAY)
    expect(range.start).toBeLessThan(now.getTime())
  })

  it('calendar from a Monday yields the previous Monday', () => {
    const now = new Date(2026, 0, 5, 9, 0, 0) // Monday
    const range = reportWindowRange('weekly', 'calendar', now)
    expect(range.start).toBe(new Date(2025, 11, 29).getTime())
    expect(range.end).toBe(new Date(2026, 0, 5).getTime())
  })

  it('rolling spans the 7 days before now', () => {
    const now = new Date(2026, 0, 7, 15, 30, 0)
    const range = reportWindowRange('weekly', 'rolling', now)
    expect(range.start).toBe(now.getTime() - 7 * DAY)
    expect(range.end).toBe(now.getTime())
  })
})
