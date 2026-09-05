import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCalendar } from '../../calendar/CalendarContext'
import { addDays, getWeekDays, hourLabel, sameDay } from '../../calendar/date-utils'

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function TimeTicks({ zone, compact = false }: { zone: 'PDT' | 'JST'; compact?: boolean }) {
  const labels =
    zone === 'PDT'
      ? Array.from({ length: compact ? 8 : 22 }, (_, index) => hourLabel(index + 1))
      : [
          '4 PM',
          '5 PM',
          '6 PM',
          '7 PM',
          '8 PM',
          '9 PM',
          '10 PM',
          '11 PM',
          'SAT Jul 18',
          '12 AM',
          '1 AM',
          '2 AM',
          '3 AM',
          '4 AM',
          '5 AM',
          '6 AM',
          '7 AM',
          '8 AM',
        ]

  return (
    <div className="timezone-ticks" aria-hidden="true">
      {labels.map((label, index) =>
        label === 'SAT Jul 18' ? (
          <span className="timezone-date-badge" key={label}>
            SAT <strong>Jul 18</strong>
          </span>
        ) : (
          <span className="timezone-tick" key={`${label}-${index}`}>
            <b>{label.split(' ')[0]}</b>
            <small>{label.split(' ')[1]}</small>
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

  return (
    <div className={`calendar-headers ${viewMode === 'day' ? 'is-day-view' : ''}`}>
      <div className="day-header-row">
        <div className="header-gutter day-header-gutter">
          <span>US</span>
          <span>PDT</span>
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

      <div className="timezone-row timezone-san-francisco">
        <div className="header-gutter timezone-name">
          <span className="country-code">US</span>
          <strong>San Francisco</strong>
          <div>
            <small>PDT</small>
            <small className="you-badge">YOU</small>
          </div>
        </div>
        <div className="timezone-content">
          <TimeTicks zone={timezone} compact={viewMode === 'day'} />
          <button
            className="tablet-timezone-toggle focus-ring"
            type="button"
            onClick={() => setTimezone(timezone === 'PDT' ? 'JST' : 'PDT')}
          >
            {timezone === 'PDT' ? 'JST' : 'PDT'}
          </button>
          <span className="timezone-boundary" />
        </div>
      </div>

      <div className="timezone-row timezone-tokyo">
        <div className="header-gutter timezone-name">
          <span className="country-code">JP</span>
          <strong>Tokyo</strong>
          <div>
            <small>JST</small>
          </div>
        </div>
        <div className="timezone-content">
          <TimeTicks zone="JST" />
          <span className="timezone-boundary" />
        </div>
      </div>
    </div>
  )
}
