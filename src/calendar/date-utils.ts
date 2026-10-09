const DAY_MS = 86_400_000

export const FIDELITY_NOW = new Date(2026, 6, 17, 11, 46, 0, 0)

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function startOfWeek(date: Date) {
  const result = startOfDay(date)
  result.setDate(result.getDate() - result.getDay())
  return result
}

export function addDays(date: Date, amount: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + amount)
  return result
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

export function sameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

export function sameWeek(left: Date, right: Date) {
  return sameDay(startOfWeek(left), startOfWeek(right))
}

export function dateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function dateFromKey(key: string) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function getWeekDays(weekStart: Date) {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
}

export function getMonthCells(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  const gridStart = startOfWeek(first)
  const gridEnd = addDays(startOfWeek(last), 6)
  const count = Math.round((startOfDay(gridEnd).getTime() - gridStart.getTime()) / DAY_MS) + 1
  return Array.from({ length: count }, (_, index) => addDays(gridStart, index))
}

export function formatMonthTitle(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatDayTitle(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function formatAgendaRange(startDate: Date, daysCount = 30) {
  const endDate = addDays(startDate, daysCount - 1)
  const startMonth = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(startDate)
  const endMonth = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(endDate)
  const startYear = startDate.getFullYear()
  const endYear = endDate.getFullYear()

  if (startYear !== endYear) {
    return `${startMonth} ${startDate.getDate()}, ${startYear} – ${endMonth} ${endDate.getDate()}, ${endYear}`
  }
  if (startMonth !== endMonth) {
    return `${startMonth} ${startDate.getDate()} – ${endMonth} ${endDate.getDate()}, ${endYear}`
  }
  return `${startMonth} ${startDate.getDate()} – ${endDate.getDate()}, ${endYear}`
}

export function formatWeekRange(weekStart: Date) {
  const weekEnd = addDays(weekStart, 6)
  const startMonth = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(weekStart)
  const endMonth = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(weekEnd)
  const startYear = weekStart.getFullYear()
  const endYear = weekEnd.getFullYear()

  if (startYear !== endYear) {
    return `${startMonth} ${weekStart.getDate()}, ${startYear} – ${endMonth} ${weekEnd.getDate()}, ${endYear}`
  }

  if (weekStart.getMonth() !== weekEnd.getMonth()) {
    return `${startMonth} ${weekStart.getDate()} – ${endMonth} ${weekEnd.getDate()}, ${endYear}`
  }

  return `${startMonth} ${weekStart.getDate()} – ${weekEnd.getDate()}, ${endYear}`
}

export function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function formatShortDatePt(date: Date) {
  // Exemplo: "Qua, 15" ou "Seg, 13"
  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date)
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1).replace('.', '')
  return `${capitalizedWeekday}, ${date.getDate()}`
}

export function minutesToTime(minutes: number) {
  if (minutes === 1440) return '12:00 AM'
  const hour = Math.floor(minutes / 60) % 24
  const minute = minutes % 60
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${String(minute).padStart(2, '0')} ${suffix}`
}

export function hourLabel(hour: number) {
  const normalized = ((hour % 24) + 24) % 24
  const suffix = normalized >= 12 ? 'PM' : 'AM'
  return `${normalized % 12 || 12} ${suffix}`
}

export function snapMinutes(minutes: number) {
  return Math.round(minutes / 15) * 15
}

export function clampMinutes(minutes: number, minimum = 0, maximum = 1440) {
  return Math.min(maximum, Math.max(minimum, minutes))
}

export const TIMEZONE_BRASIL = 'America/Sao_Paulo'
export const TIMEZONE_JERUSALEM = 'Asia/Jerusalem'

/**
 * Returns the timezone offset in milliseconds for a given IANA time zone at an exact instant.
 * offset = targetZoneTime - utcTime (positive if ahead of UTC, e.g. +3h = +10800000)
 */
export function getTimezoneOffset(timeZone: string, date: Date): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    })
    const parts = formatter.formatToParts(date)
    let year = 0
    let month = 0
    let day = 0
    let hour = 0
    let minute = 0
    let second = 0
    for (const part of parts) {
      if (part.type === 'year') year = Number.parseInt(part.value, 10)
      else if (part.type === 'month') month = Number.parseInt(part.value, 10)
      else if (part.type === 'day') day = Number.parseInt(part.value, 10)
      else if (part.type === 'hour') {
        const h = Number.parseInt(part.value, 10)
        hour = h === 24 ? 0 : h
      } else if (part.type === 'minute') minute = Number.parseInt(part.value, 10)
      else if (part.type === 'second') second = Number.parseInt(part.value, 10)
    }
    const asUtcTimestamp = Date.UTC(year, month - 1, day, hour, minute, second)
    return asUtcTimestamp - date.getTime()
  } catch {
    // Fallback if timezone not recognized
    if (timeZone === TIMEZONE_BRASIL) return -3 * 3600 * 1000
    if (timeZone === TIMEZONE_JERUSALEM) return 3 * 3600 * 1000
    return 0
  }
}

/**
 * Converts a calendar wall-clock date & hour (assumed in Brazil/America/Sao_Paulo timezone)
 * to the exact UTC timestamp.
 */
export function getUtcInstantForBrazilTime(baseDate: Date, hour: number, minute = 0): Date {
  const y = baseDate.getFullYear()
  const m = baseDate.getMonth()
  const d = baseDate.getDate()

  // First guess: Brazil is UTC-3 (current standard time since DST was abolished)
  let utcMs = Date.UTC(y, m, d, hour + 3, minute, 0)
  // Verify with Intl to guarantee correctness even if DST or timezone rules shift
  const offset = getTimezoneOffset(TIMEZONE_BRASIL, new Date(utcMs))
  const targetWallClockMs = Date.UTC(y, m, d, hour, minute, 0)
  utcMs = targetWallClockMs - offset
  return new Date(utcMs)
}

/**
 * Returns the short timezone abbreviation (e.g. BRT, IST, IDT) or offset for a specific date and IANA time zone.
 */
export function getTimezoneCode(timeZone: string, date: Date = FIDELITY_NOW): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short',
    })
    const parts = formatter.formatToParts(date)
    const tzPart = parts.find((part) => part.type === 'timeZoneName')
    return tzPart?.value ?? (timeZone === TIMEZONE_BRASIL ? 'BRT' : 'IDT')
  } catch {
    return timeZone === TIMEZONE_BRASIL ? 'BRT' : 'IST'
  }
}

export interface TimezoneTickItem {
  type: 'tick' | 'date-badge'
  key: string
  hourText?: string
  suffix?: string
  badgeWeekday?: string
  badgeMonthDay?: string
}

/**
 * Computes dynamic timezone ticks for a given IANA time zone relative to the reference date.
 * In day view (compact), shows 8 ticks (starting from 1 AM / local hour offset).
 * In week view, shows 22 ticks representing the hours across the visible header window.
 * If midnight crossing occurs (e.g. into the next day), a date badge (e.g. SAT Jul 18) is dynamically rendered.
 */
export function generateTimezoneTicks(
  timeZone: string,
  referenceDate: Date,
  compact = false,
): TimezoneTickItem[] {
  const tickCount = compact ? 8 : 22
  const items: TimezoneTickItem[] = []

  let previousDay = -1

  const hourFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  })

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  for (let i = 0; i < tickCount; i++) {
    const brasilHour = i + 1
    // Exact UTC instant corresponding to this hour in America/Sao_Paulo on referenceDate
    const instant = getUtcInstantForBrazilTime(referenceDate, brasilHour, 0)

    const dateParts = dateFormatter.formatToParts(instant)
    const weekday = dateParts.find((p) => p.type === 'weekday')?.value?.toUpperCase() ?? 'SAT'
    const month = dateParts.find((p) => p.type === 'month')?.value ?? 'Jul'
    const day = dateParts.find((p) => p.type === 'day')?.value ?? '1'
    const currentDayNum = Number.parseInt(day, 10)

    // Detect day boundary transition (midnight crossing) into another calendar date in target zone
    if (i > 0 && previousDay !== -1 && currentDayNum !== previousDay && items.length < tickCount) {
      items.push({
        type: 'date-badge',
        key: `badge-${timeZone}-${weekday}-${month}-${day}-${i}`,
        badgeWeekday: weekday,
        badgeMonthDay: `${month} ${day}`,
      })
    }
    previousDay = currentDayNum

    const parts = hourFormatter.formatToParts(instant)
    const h = parts.find((p) => p.type === 'hour')?.value ?? '12'
    const dayPeriod = parts.find((p) => p.type === 'dayPeriod')?.value?.toUpperCase() ?? 'AM'

    items.push({
      type: 'tick',
      key: `tick-${timeZone}-${i}-${h}-${dayPeriod}`,
      hourText: h,
      suffix: dayPeriod,
    })
  }

  // Ensure exact count matches original visual grid ticks
  return items.slice(0, tickCount)
}
