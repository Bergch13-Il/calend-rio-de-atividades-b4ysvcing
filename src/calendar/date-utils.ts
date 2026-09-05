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
