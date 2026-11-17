const MANILA_TIME_ZONE = 'Asia/Manila'
const EMPTY = '\u2014'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: MANILA_TIME_ZONE,
})

/**
 * Formats a decimal money string without doing arithmetic on it.
 * The API always sends money as a string.
 */
export function formatMoney(value: string | null | undefined): string {
  if (value === null || value === undefined || value.trim() === '') {
    return EMPTY
  }

  const raw = value.trim()
  const negative = raw.startsWith('-')
  const unsigned = negative ? raw.slice(1) : raw
  const [integerPart, fractionPart = ''] = unsigned.split('.')

  if (!/^\d+$/.test(integerPart)) {
    return EMPTY
  }

  const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const decimals = fractionPart.padEnd(2, '0').slice(0, 2)

  return `${negative ? '-' : ''}\u20b1${grouped}.${decimals}`
}

/**
 * Formats a date-only value (YYYY-MM-DD) without applying a timezone shift.
 */
export function formatDate(value: string | null | undefined): string {
  if (value === null || value === undefined || value.trim() === '') {
    return EMPTY
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())

  if (!match) {
    return EMPTY
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return EMPTY
  }

  return dateFormatter.format(date)
}

/**
 * Formats an ISO 8601 timestamp in Asia/Manila.
 */
export function formatDateTime(value: string | null | undefined): string {
  if (value === null || value === undefined || value.trim() === '') {
    return EMPTY
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return EMPTY
  }

  return dateTimeFormatter.format(date)
}

export function formatBytes(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return EMPTY
  }

  if (value < 1024) {
    return `${value} B`
  }

  const units = ['KB', 'MB', 'GB', 'TB']
  let size = value / 1024
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

/**
 * Displays the API's days_remaining value. The 35-day rule is never
 * recomputed in the browser.
 */
export function formatDays(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return EMPTY
  }

  if (value < 0) {
    const overdue = Math.abs(value)

    return `${overdue} ${overdue === 1 ? 'day' : 'days'} overdue`
  }

  if (value === 0) {
    return 'Due today'
  }

  return `${value} ${value === 1 ? 'day' : 'days'} remaining`
}

export function formatProgress(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return EMPTY
  }

  return `${value}%`
}
