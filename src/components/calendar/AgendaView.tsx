import { Calendar, CalendarDays, Clock, MapPin, Plus, Trash2, Video, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useCalendar } from '../../calendar/CalendarContext'
import {
  addDays,
  dateFromKey,
  dateKey,
  formatLongDate,
  minutesToTime,
  sameDay,
  startOfDay,
} from '../../calendar/date-utils'
import { PALETTES } from '../../calendar/seed'
import type { CalendarEvent } from '../../calendar/types'

interface DayGroup {
  date: Date
  dateString: string
  isToday: boolean
  isPast: boolean
  events: CalendarEvent[]
}

interface SelectedPopoverEvent {
  event: CalendarEvent
  anchorRect: DOMRect
}

const AGENDA_DAYS_SPAN = 30 // Display 30 days starting from selectedDay or week start

export function AgendaView() {
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

  const [popoverEvent, setPopoverEvent] = useState<SelectedPopoverEvent | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

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

  const enabledAccounts = useMemo(
    () => new Set(accounts.filter((account) => account.enabled).map((account) => account.id)),
    [accounts],
  )
  const accountMap = useMemo(() => new Map(accounts.map((acc) => [acc.id, acc])), [accounts])

  const normalizedSearch = searchQuery.trim().toLocaleLowerCase()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const todayStart = startOfDay(now).getTime()

  // Build the list of active dates for the agenda window
  const dayGroups = useMemo(() => {
    // Starting date: reference from selectedDay (or from beginning of the day)
    const startDate = startOfDay(selectedDay)
    const groups: DayGroup[] = []

    for (let i = 0; i < AGENDA_DAYS_SPAN; i++) {
      const d = addDays(startDate, i)
      const key = dateKey(d)
      const isToday = sameDay(d, now)
      const isPast = d.getTime() < todayStart

      // Find events for this day
      const dayEvents = events
        .filter((event) => event.date === key && enabledAccounts.has(event.accountId))
        .sort((a, b) => a.start - b.start)

      // Only include the day group if there are events, or if it is Today or the Start day
      if (dayEvents.length > 0 || isToday || i === 0) {
        groups.push({
          date: d,
          dateString: key,
          isToday,
          isPast,
          events: dayEvents,
        })
      }
    }

    return groups
  }, [enabledAccounts, events, now, selectedDay, todayStart])

  const totalEventsCount = useMemo(
    () => dayGroups.reduce((acc, g) => acc + g.events.length, 0),
    [dayGroups],
  )

  const handleRowClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setPopoverEvent({ event, anchorRect: rect })
  }

  const activeAccount = popoverEvent
    ? (accountMap.get(popoverEvent.event.accountId) ?? accounts[0])
    : accounts[0]
  const activePalette = popoverEvent
    ? (PALETTES[popoverEvent.event.palette] ?? PALETTES.lavender)
    : PALETTES.lavender

  return (
    <div className="agenda-view-container">
      {/* Agenda top bar info */}
      <div className="agenda-info-banner">
        <div className="agenda-info-summary">
          <CalendarDays size={16} />
          <span>
            <strong>{totalEventsCount} events</strong> scheduled in the next 30 days
          </span>
        </div>
        <button
          type="button"
          className="agenda-quick-add-btn focus-ring"
          onClick={() => openCreate({ date: dateKey(selectedDay) })}
        >
          <Plus size={14} />
          <span>New event</span>
        </button>
      </div>

      {totalEventsCount === 0 ? (
        <div className="agenda-empty-state">
          <div className="agenda-empty-icon">
            <Calendar size={36} />
          </div>
          <h3>No events scheduled</h3>
          <p>There are no activities matching your current filters or selected time window.</p>
          <button
            type="button"
            className="agenda-empty-create-btn focus-ring"
            onClick={() => openCreate({ date: dateKey(selectedDay) })}
          >
            <Plus size={15} /> Create your first event
          </button>
        </div>
      ) : (
        <div className="agenda-groups-list">
          {dayGroups.map((group) => {
            const weekdayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(
              group.date,
            )
            const monthDay = new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: 'numeric',
            }).format(group.date)
            const isWeekend = group.date.getDay() === 0 || group.date.getDay() === 6

            return (
              <div
                key={group.dateString}
                className={`agenda-day-group ${group.isToday ? 'is-today' : ''} ${
                  group.isPast ? 'is-past-day' : ''
                }`}
              >
                {/* Header do dia */}
                <div className="agenda-day-header">
                  <button
                    type="button"
                    className="agenda-day-title-btn focus-ring"
                    onClick={() => jumpToDate(group.date, true)}
                    title={`Go to Day view for ${group.date.toDateString()}`}
                  >
                    <span className={`agenda-day-circle ${group.isToday ? 'is-today-circle' : ''}`}>
                      {group.date.getDate()}
                    </span>
                    <span className="agenda-day-label">
                      <strong>{weekdayName}</strong>, {monthDay}
                    </span>
                    {group.isToday && <span className="agenda-today-badge">TODAY</span>}
                  </button>

                  <span className="agenda-day-count">
                    {group.events.length} {group.events.length === 1 ? 'event' : 'events'}
                  </span>
                </div>

                {/* Lista de eventos do dia */}
                <div className="agenda-day-events">
                  {group.events.length === 0 ? (
                    <div className="agenda-day-no-events">
                      <span>No events scheduled</span>
                      <button
                        type="button"
                        className="agenda-day-add-link focus-ring"
                        onClick={() => openCreate({ date: group.dateString })}
                      >
                        + Add event
                      </button>
                    </div>
                  ) : (
                    group.events.map((event) => {
                      const palette = PALETTES[event.palette] ?? PALETTES.lavender
                      const account = accountMap.get(event.accountId) ?? accounts[0]
                      const isPastEvent = group.isPast || (group.isToday && event.end <= nowMinutes)
                      const isCurrentEvent =
                        group.isToday && event.start <= nowMinutes && event.end > nowMinutes
                      const isMatch =
                        normalizedSearch &&
                        event.title.toLocaleLowerCase().includes(normalizedSearch)
                      const isDimmed =
                        Boolean(normalizedSearch) &&
                        !event.title.toLocaleLowerCase().includes(normalizedSearch)

                      const isAllDay = event.start === 0 && event.end === 1440

                      return (
                        <div
                          key={event.id}
                          className={`agenda-event-row focus-ring ${
                            isPastEvent ? 'is-past-event' : ''
                          } ${isCurrentEvent ? 'is-current-event' : ''} ${
                            isMatch ? 'is-search-match' : ''
                          } ${isDimmed ? 'is-search-dimmed' : ''}`}
                          style={{
                            borderLeftColor: palette.accent,
                          }}
                          onClick={(e) => handleRowClick(event, e)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleRowClick(event, e as unknown as React.MouseEvent)
                            }
                          }}
                        >
                          {/* Accent bar & Account dot */}
                          <div className="agenda-row-indicator">
                            <span
                              className="agenda-account-dot"
                              style={{ backgroundColor: account.color }}
                              title={account.email}
                            />
                          </div>

                          {/* Time */}
                          <div className="agenda-row-time">
                            <Clock size={12} className="agenda-time-icon" />
                            {isAllDay ? (
                              <span className="agenda-time-all-day">All day</span>
                            ) : (
                              <span>
                                {minutesToTime(event.start)} – {minutesToTime(event.end)}
                              </span>
                            )}
                          </div>

                          {/* Event info */}
                          <div className="agenda-row-main">
                            <strong className="agenda-row-title">{event.title}</strong>
                            <div className="agenda-row-meta">
                              <span className="agenda-row-acc-name">{account.email}</span>
                              {event.location && (
                                <span className="agenda-row-location">
                                  {event.location === 'Microsoft Teams' ||
                                  event.location === 'Zoom' ? (
                                    <Video size={11} />
                                  ) : (
                                    <MapPin size={11} />
                                  )}
                                  {event.location}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Color badge preview */}
                          <div className="agenda-row-tag">
                            <span
                              className="agenda-palette-badge"
                              style={{
                                backgroundColor: palette.fill,
                                color: palette.accent,
                                borderColor: palette.accent,
                              }}
                            >
                              {palette.name}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Popover de detalhes */}
      {popoverEvent && (
        <div
          ref={popoverRef}
          className="agenda-event-popover"
          style={{
            top: Math.min(
              window.innerHeight - 280,
              Math.max(10, popoverEvent.anchorRect.bottom + 6),
            ),
            left: Math.min(
              window.innerWidth - 300,
              Math.max(10, popoverEvent.anchorRect.left + 20),
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
    </div>
  )
}
