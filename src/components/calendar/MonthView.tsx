import { MapPin, Plus, Trash2, Video, X } from 'lucide-react'
import { type MouseEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useCalendar } from '../../calendar/CalendarContext'
import {
  dateFromKey,
  dateKey,
  formatLongDate,
  getMonthCells,
  minutesToTime,
  sameDay,
} from '../../calendar/date-utils'
import { PALETTES } from '../../calendar/seed'
import type { CalendarEvent } from '../../calendar/types'

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MAX_CHIPS_PER_CELL = 3

interface DayExpandedModal {
  date: Date
  events: CalendarEvent[]
}

interface SelectedPopoverEvent {
  event: CalendarEvent
  anchorRect: DOMRect
}

export function MonthView() {
  const {
    accounts,
    deleteEvent,
    events,
    jumpToDate,
    now,
    openCreate,
    openEdit,
    searchQuery,
    selectedDay,
  } = useCalendar()

  const [expandedDay, setExpandedDay] = useState<DayExpandedModal | null>(null)
  const [popoverEvent, setPopoverEvent] = useState<SelectedPopoverEvent | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const expandedDayRef = useRef<HTMLDivElement>(null)

  // Close popover on click outside
  useEffect(() => {
    if (!popoverEvent) return
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverEvent(null)
      }
    }
    window.addEventListener('mousedown', handleClickOutside)
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [popoverEvent])

  // Close expanded day modal on click outside
  useEffect(() => {
    if (!expandedDay) return
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (
        expandedDayRef.current &&
        !expandedDayRef.current.contains(e.target as Node) &&
        !popoverRef.current?.contains(e.target as Node)
      ) {
        setExpandedDay(null)
      }
    }
    window.addEventListener('mousedown', handleClickOutside)
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [expandedDay])

  const enabledAccounts = useMemo(
    () => new Set(accounts.filter((account) => account.enabled).map((account) => account.id)),
    [accounts],
  )
  const accountMap = useMemo(() => new Map(accounts.map((acc) => [acc.id, acc])), [accounts])

  const normalizedSearch = searchQuery.trim().toLocaleLowerCase()

  // Month cells (SUN -> SAT) for the selectedDay's month
  const monthCells = useMemo(() => getMonthCells(selectedDay), [selectedDay])

  // Map of dateKey -> visible filtered events
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    events.forEach((event) => {
      if (!enabledAccounts.has(event.accountId)) return
      const list = map.get(event.date) ?? []
      list.push(event)
      map.set(event.date, list)
    })
    // Sort events in each day by start time
    map.forEach((list) => {
      list.sort((a, b) => a.start - b.start)
    })
    return map
  }, [enabledAccounts, events])

  const handleCellClick = (cellDate: Date) => {
    // Single click on empty area pre-fills creation modal or readies day
  }

  const handleCellDoubleClick = (cellDate: Date, e: MouseEvent) => {
    e.stopPropagation()
    openCreate({
      date: dateKey(cellDate),
      start: 540,
      end: 600,
    })
  }

  const handleChipClick = (event: CalendarEvent, e: MouseEvent) => {
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setPopoverEvent({ event, anchorRect: rect })
  }

  const handleMoreClick = (cellDate: Date, cellEvents: CalendarEvent[], e: MouseEvent) => {
    e.stopPropagation()
    setExpandedDay({ date: cellDate, events: cellEvents })
  }

  const activeAccount = popoverEvent
    ? (accountMap.get(popoverEvent.event.accountId) ?? accounts[0])
    : accounts[0]
  const activePalette = popoverEvent
    ? (PALETTES[popoverEvent.event.palette] ?? PALETTES.lavender)
    : PALETTES.lavender

  return (
    <div className="month-view-container">
      {/* 7-column weekday header */}
      <div className="month-weekdays-header">
        {WEEKDAYS.map((dayName, idx) => (
          <div
            className={`month-weekday-col ${idx === 0 || idx === 6 ? 'is-weekend' : ''}`}
            key={dayName}
          >
            <span>{dayName}</span>
          </div>
        ))}
      </div>

      {/* Grid of days */}
      <div
        className="month-grid-body"
        style={{
          gridTemplateRows: `repeat(${Math.ceil(monthCells.length / 7)}, minmax(100px, 1fr))`,
        }}
      >
        {monthCells.map((cellDate) => {
          const key = dateKey(cellDate)
          const isCurrentMonth = cellDate.getMonth() === selectedDay.getMonth()
          const isToday = sameDay(cellDate, now)
          const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6
          const cellEvents = eventsByDate.get(key) ?? []
          const visibleChips = cellEvents.slice(0, MAX_CHIPS_PER_CELL)
          const remainingCount = cellEvents.length - visibleChips.length

          return (
            <div
              key={key}
              className={`month-cell ${!isCurrentMonth ? 'is-outside-month' : ''} ${
                isWeekend ? 'is-weekend' : ''
              }`}
              onClick={() => handleCellClick(cellDate)}
              onDoubleClick={(e) => handleCellDoubleClick(cellDate, e)}
            >
              <div className="month-cell-header">
                <button
                  type="button"
                  className={`month-day-number focus-ring ${isToday ? 'is-today' : ''} ${
                    !isCurrentMonth ? 'is-dimmed' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    jumpToDate(cellDate, true)
                  }}
                  title={`Go to ${cellDate.toLocaleDateString('en-US')}`}
                  aria-label={`Go to day view for ${cellDate.toDateString()}`}
                >
                  {cellDate.getDate()}
                </button>
                <button
                  type="button"
                  className="month-cell-add-btn focus-ring"
                  aria-label={`Add event on ${key}`}
                  title="Add event"
                  onClick={(e) => {
                    e.stopPropagation()
                    openCreate({
                      date: key,
                      start: 540,
                      end: 600,
                    })
                  }}
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Event chips */}
              <div className="month-cell-chips">
                {visibleChips.map((event) => {
                  const palette = PALETTES[event.palette] ?? PALETTES.lavender
                  const isMatch =
                    normalizedSearch && event.title.toLocaleLowerCase().includes(normalizedSearch)
                  const isDimmed =
                    Boolean(normalizedSearch) &&
                    !event.title.toLocaleLowerCase().includes(normalizedSearch)

                  return (
                    <button
                      type="button"
                      key={event.id}
                      className={`month-event-chip focus-ring ${
                        isMatch ? 'is-search-match' : ''
                      } ${isDimmed ? 'is-search-dimmed' : ''}`}
                      style={{
                        backgroundColor: palette.fill,
                        borderLeftColor: palette.accent,
                      }}
                      onClick={(e) => handleChipClick(event, e)}
                      title={`${event.title} (${minutesToTime(event.start)} - ${minutesToTime(
                        event.end,
                      )})`}
                    >
                      <span className="month-chip-time">{minutesToTime(event.start)}</span>
                      <span className="month-chip-title">{event.title}</span>
                    </button>
                  )
                })}

                {remainingCount > 0 && (
                  <button
                    type="button"
                    className="month-more-chip focus-ring"
                    onClick={(e) => handleMoreClick(cellDate, cellEvents, e)}
                    aria-label={`View ${remainingCount} more events for ${key}`}
                  >
                    +{remainingCount} more
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Popover de detalhes do evento */}
      {popoverEvent && (
        <div
          ref={popoverRef}
          className="month-event-popover"
          style={{
            top: Math.min(
              window.innerHeight - 280,
              Math.max(10, popoverEvent.anchorRect.bottom + 6),
            ),
            left: Math.min(
              window.innerWidth - 290,
              Math.max(10, popoverEvent.anchorRect.left - 40),
            ),
          }}
        >
          <button
            className="popover-close focus-ring"
            type="button"
            aria-label="Close details"
            onClick={() => setPopoverEvent(null)}
          >
            <X size={15} />
          </button>
          <span className="popover-accent" style={{ backgroundColor: activePalette.accent }} />
          <h3>{popoverEvent.event.title}</h3>
          <p>{formatLongDate(dateFromKey(popoverEvent.event.date))}</p>
          <p>
            {minutesToTime(popoverEvent.event.start)} – {minutesToTime(popoverEvent.event.end)}
          </p>
          <div className="popover-account">
            <span style={{ backgroundColor: activeAccount.color }} />
            {activeAccount.email}
          </div>
          <div className="popover-location">
            {popoverEvent.event.location ? (
              <>
                {popoverEvent.event.location === 'Microsoft Teams' ||
                popoverEvent.event.location === 'Zoom' ? (
                  <Video size={13} />
                ) : (
                  <MapPin size={13} />
                )}
                <span>{popoverEvent.event.location}</span>
              </>
            ) : (
              <>
                <MapPin size={13} />
                <span>No location</span>
              </>
            )}
          </div>
          <div className="popover-actions">
            <button
              className="popover-delete focus-ring"
              type="button"
              onClick={() => {
                deleteEvent(popoverEvent.event.id)
                setPopoverEvent(null)
              }}
            >
              <Trash2 size={13} /> Delete
            </button>
            <button
              className="popover-edit focus-ring"
              type="button"
              onClick={() => {
                openEdit(popoverEvent.event.id)
                setPopoverEvent(null)
              }}
            >
              Edit
            </button>
          </div>
        </div>
      )}

      {/* Expanded day modal (+N more) */}
      {expandedDay && (
        <div className="day-expanded-modal-overlay">
          <div className="day-expanded-modal" ref={expandedDayRef}>
            <div className="day-expanded-header">
              <div className="day-expanded-title-area">
                <button
                  type="button"
                  className={`month-day-number focus-ring ${
                    sameDay(expandedDay.date, now) ? 'is-today' : ''
                  }`}
                  onClick={() => {
                    jumpToDate(expandedDay.date, true)
                    setExpandedDay(null)
                  }}
                >
                  {expandedDay.date.getDate()}
                </button>
                <div>
                  <h3>
                    {new Intl.DateTimeFormat('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    }).format(expandedDay.date)}
                  </h3>
                  <span>{expandedDay.events.length} events scheduled</span>
                </div>
              </div>
              <button
                type="button"
                className="day-expanded-close focus-ring"
                onClick={() => setExpandedDay(null)}
                aria-label="Close day view"
              >
                <X size={18} />
              </button>
            </div>

            <div className="day-expanded-list">
              {expandedDay.events.length === 0 ? (
                <div className="day-expanded-empty">No events on this day</div>
              ) : (
                expandedDay.events.map((event) => {
                  const palette = PALETTES[event.palette] ?? PALETTES.lavender
                  const account = accountMap.get(event.accountId) ?? accounts[0]
                  const isMatch =
                    normalizedSearch && event.title.toLocaleLowerCase().includes(normalizedSearch)

                  return (
                    <div
                      key={event.id}
                      className={`day-expanded-item ${isMatch ? 'is-search-match' : ''}`}
                      style={{
                        backgroundColor: palette.fill,
                        borderLeftColor: palette.accent,
                      }}
                      onClick={(e) => handleChipClick(event, e)}
                    >
                      <div className="day-expanded-item-main">
                        <strong className="day-expanded-item-title">{event.title}</strong>
                        <span className="day-expanded-item-time">
                          {minutesToTime(event.start)} – {minutesToTime(event.end)}
                        </span>
                        {event.location && (
                          <span className="day-expanded-item-loc">
                            <MapPin size={11} /> {event.location}
                          </span>
                        )}
                      </div>
                      <div className="day-expanded-item-acc">
                        <span
                          className="acc-dot"
                          style={{ backgroundColor: account.color }}
                          title={account.email}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="day-expanded-footer">
              <button
                type="button"
                className="day-expanded-add-btn focus-ring"
                onClick={() => {
                  openCreate({
                    date: dateKey(expandedDay.date),
                    start: 540,
                    end: 600,
                  })
                  setExpandedDay(null)
                }}
              >
                <Plus size={14} /> Add event on this day
              </button>
              <button
                type="button"
                className="day-expanded-jump-btn focus-ring"
                onClick={() => {
                  jumpToDate(expandedDay.date, true)
                  setExpandedDay(null)
                }}
              >
                Go to Day View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
