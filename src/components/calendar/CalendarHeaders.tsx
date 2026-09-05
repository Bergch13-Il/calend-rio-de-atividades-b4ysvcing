import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCalendar } from '../../calendar/CalendarContext'
import {
  addDays,
  generateTimezoneTicks,
  getTimezoneCode,
  getWeekDays,
  sameDay,
  TIMEZONE_BRASIL,
  TIMEZONE_JERUSALEM,
} from '../../calendar/date-utils'

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function TimeTicks({
  timeZone,
  referenceDate,
  compact = false,
}: {
  timeZone: string
  referenceDate: Date
  compact?: boolean
}) {
  const ticks = generateTimezoneTicks(timeZone, referenceDate, compact)

  return (
    <div className="timezone-ticks" aria-hidden="true">
      {ticks.map((item, index) =>
        item.type === 'date-badge' ? (
          <span className="timezone-date-badge" key={item.key || `badge-${index}`}>
            {item.badgeWeekday} <strong>{item.badgeMonthDay}</strong>
          </span>
        ) : (
          <span className="timezone-tick" key={item.key || `tick-${index}`}>
            <b>{item.hourText}</b>
            <small>{item.suffix}</small>
          </span>
        ),
      )}
    </div>
  )
}

export function CalendarHeaders() {
  const {
    currentWeekStart,
    jumpToDate,
    now,
    selectedDay,
    setSelectedDay,
    setTimezone,
    timezone,
    viewMode,
  } = useCalendar()
  const weekDays = getWeekDays(currentWeekStart)
  const visibleDays = viewMode === 'week' ? weekDays : [selectedDay]

  const moveDay = (amount: number) => {
    const next = addDays(selectedDay, amount)
    setSelectedDay(next)
  }

  const referenceDate = viewMode === 'day' ? selectedDay : currentWeekStart
  const brasilCode = getTimezoneCode(TIMEZONE_BRASIL, referenceDate)
  const jerusalemCode = getTimezoneCode(TIMEZONE_JERUSALEM, referenceDate)

  // On smaller screens where one timezone row is shown, respect active user toggle
  const activeSingleZone = timezone === 'BRT' ? TIMEZONE_BRASIL : TIMEZONE_JERUSALEM
  const activeSingleCode = timezone === 'BRT' ? brasilCode : jerusalemCode
  const toggleNextCode = timezone === 'BRT' ? jerusalemCode : brasilCode

  return (
    <div className={`calendar-headers ${viewMode === 'day' ? 'is-day-view' : ''}`}>
      <div className="day-header-row">
        <div className="header-gutter day-header-gutter">
          <span>BR</span>
          <span>{brasilCode}</span>
        </div>
        <div
          className="day-header-cells"
          style={{ '--visible-days': visibleDays.length } as React.CSSProperties}
        >
          {visibleDays.map((date) => {
            const isToday = sameDay(date, now)
            const weekend = date.getDay() === 0 || date.getDay() === 6
            return (
              <button
                className={`day-header-cell focus-ring ${weekend ? 'is-weekend' : ''}`}
                key={date.toISOString()}
                type="button"
                onClick={() => jumpToDate(date, true)}
                aria-label={`Open ${date.toDateString()} day view`}
              >
                <span>{WEEKDAYS[date.getDay()]}</span>
                <strong className={isToday ? 'today-number' : ''}>{date.getDate()}</strong>
              </button>
            )
          })}
        </div>
        {viewMode === 'day' && (
          <div className="mobile-day-switcher">
            <button
              className="focus-ring"
              type="button"
              aria-label="Previous day"
              onClick={() => moveDay(-1)}
            >
              <ChevronLeft size={15} />
            </button>
            <button
              className="focus-ring"
              type="button"
              aria-label="Next day"
              onClick={() => moveDay(1)}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>

      <div className="timezone-row timezone-brasil">
        <div className="header-gutter timezone-name">
          <span className="country-code">BR</span>
          <strong>Brasil (Paraná)</strong>
          <div>
            <small>{brasilCode}</small>
            <small className="you-badge">YOU</small>
          </div>
        </div>
        <div className="timezone-content">
          <TimeTicks
            timeZone={TIMEZONE_BRASIL}
            referenceDate={referenceDate}
            compact={viewMode === 'day'}
          />
          <button
            className="tablet-timezone-toggle focus-ring"
            type="button"
            onClick={() => setTimezone(timezone === 'BRT' ? 'IST' : 'BRT')}
            aria-label={`Alternar fuso para ${toggleNextCode}`}
          >
            {activeSingleCode}
          </button>
          <span className="timezone-boundary" />
        </div>
      </div>

      <div className="timezone-row timezone-jerusalem">
        <div className="header-gutter timezone-name">
          <span className="country-code">IL</span>
          <strong>Jerusalem</strong>
          <div>
            <small>{jerusalemCode}</small>
          </div>
        </div>
        <div className="timezone-content">
          <TimeTicks
            timeZone={TIMEZONE_JERUSALEM}
            referenceDate={referenceDate}
            compact={viewMode === 'day'}
          />
          <span className="timezone-boundary" />
        </div>
      </div>
    </div>
  )
}
