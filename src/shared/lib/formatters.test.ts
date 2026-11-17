import { describe, expect, it } from 'vitest'
import {
  formatBytes,
  formatDate,
  formatDateTime,
  formatDays,
  formatMoney,
  formatProgress,
} from './formatters'

describe('formatMoney', () => {
  it('groups a decimal string without arithmetic', () => {
    expect(formatMoney('1250000.5')).toBe('\u20b11,250,000.50')
    expect(formatMoney('0')).toBe('\u20b10.00')
    expect(formatMoney('-2500.75')).toBe('-\u20b12,500.75')
  })

  it('returns a dash for missing or invalid money', () => {
    expect(formatMoney(null)).toBe('\u2014')
    expect(formatMoney('')).toBe('\u2014')
    expect(formatMoney('not money')).toBe('\u2014')
  })
})

describe('formatDate', () => {
  it('formats a date-only value without a timezone shift', () => {
    expect(formatDate('2026-03-05')).toBe('Mar 5, 2026')
    expect(formatDate('2026-01-01')).toBe('Jan 1, 2026')
  })

  it('rejects impossible dates', () => {
    expect(formatDate('2026-02-30')).toBe('\u2014')
  })
})

describe('formatDateTime', () => {
  it('formats a timestamp in Asia/Manila', () => {
    const formatted = formatDateTime('2026-03-05T06:30:00Z')

    expect(formatted).toContain('Mar 5, 2026')
    expect(formatted).toContain('2:30')
  })

  it('returns a dash for invalid timestamps', () => {
    expect(formatDateTime('not a timestamp')).toBe('\u2014')
  })
})

describe('formatDays', () => {
  it('describes remaining, due, and overdue days', () => {
    expect(formatDays(36)).toBe('36 days remaining')
    expect(formatDays(1)).toBe('1 day remaining')
    expect(formatDays(0)).toBe('Due today')
    expect(formatDays(-3)).toBe('3 days overdue')
    expect(formatDays(-1)).toBe('1 day overdue')
  })
})

describe('formatBytes and formatProgress', () => {
  it('formats file sizes', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB')
  })

  it('formats progress as the API value', () => {
    expect(formatProgress(0)).toBe('0%')
    expect(formatProgress(100)).toBe('100%')
    expect(formatProgress(null)).toBe('\u2014')
  })
})
