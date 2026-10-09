import { CalendarDays, ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useCalendar } from '../../calendar/CalendarContext'
import {
  dateFromKey,
  dateKey,
  formatWeekRange,
  getWeekDays,
  minutesToTime,
} from '../../calendar/date-utils'

const ACTIONS = ['Summarize my week', 'Find a meeting slot', 'Draft follow-ups'] as const

export function CalendarToolbar() {
  const {
    agentOpen,
    accounts,
    currentWeekStart,
    events,
    goToday,
    navigateDate,
    selectedDay,
    setAgentOpen,
    setViewMode,
    viewMode,
    weekAnimationKey,
  } = useCalendar()
  const [agentAction, setAgentAction] = useState<(typeof ACTIONS)[number]>(ACTIONS[0])

  const visibleWeekEvents = useMemo(() => {
    const keys = new Set(getWeekDays(currentWeekStart).map(dateKey))
    const enabledIds = new Set(
      accounts.filter((account) => account.enabled).map((account) => account.id),
    )
    return events.filter((event) => keys.has(event.date) && enabledIds.has(event.accountId))
  }, [accounts, currentWeekStart, events])

  const summary = useMemo(() => {
    const byDay = new Map<string, number>()
    let minutes = 0
    visibleWeekEvents.forEach((event) => {
      byDay.set(event.date, (byDay.get(event.date) ?? 0) + 1)
      minutes += event.end - event.start
    })
    const busiestEntry = [...byDay.entries()].sort((left, right) => right[1] - left[1])[0]
    const busiestDay = busiestEntry
      ? new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(dateFromKey(busiestEntry[0]))
      : 'No busy day'
    const hours = minutes / 60
    return {
      count: visibleWeekEvents.length,
      busiestDay,
      hours: Number.isInteger(hours) ? String(hours) : hours.toFixed(1),
    }
  }, [visibleWeekEvents])

  return (
    <>
      <header className="calendar-toolbar">
        <div className="toolbar-leading">
          <button className="today-button focus-ring" type="button" onClick={goToday}>
            <CalendarDays size={15} />
            <span>Today</span>
          </button>
          <div className="week-nav" aria-label="Calendar navigation">
            <button
              className="toolbar-icon-button focus-ring"
              type="button"
              aria-label={
                viewMode === 'day'
                  ? 'Previous day'
                  : viewMode === 'week'
                    ? 'Previous week'
                    : viewMode === 'month'
                      ? 'Previous month'
                      : 'Previous period'
              }
              onClick={() => navigateDate(-1)}
            >
              <ChevronLeft size={17} />
            </button>
            <button
              className="toolbar-icon-button focus-ring"
              type="button"
              aria-label={
                viewMode === 'day'
                  ? 'Next day'
                  : viewMode === 'week'
                    ? 'Next week'
                    : viewMode === 'month'
                      ? 'Next month'
                      : 'Next period'
              }
              onClick={() => navigateDate(1)}
            >
              <ChevronRight size={17} />
            </button>
          </div>
          <h1 className="week-range-title" key={weekAnimationKey}>
            {viewMode === 'day'
              ? new Intl.DateTimeFormat('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                }).format(selectedDay)
              : viewMode === 'week'
                ? formatWeekRange(currentWeekStart)
                : viewMode === 'month'
                  ? new Intl.DateTimeFormat('en-US', {
                      month: 'long',
                      year: 'numeric',
                    }).format(selectedDay)
                  : `${new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                    }).format(selectedDay)} – ${new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }).format(new Date(selectedDay.getTime() + 29 * 86400000))}`}
          </h1>
        </div>
        <div className="toolbar-actions">
          <div className="view-toggle" aria-label="Calendar view">
            <button
              className={`focus-ring ${viewMode === 'day' ? 'is-active' : ''}`}
              type="button"
              aria-pressed={viewMode === 'day'}
              onClick={() => setViewMode('day')}
            >
              Day
            </button>
            <button
              className={`focus-ring ${viewMode === 'week' ? 'is-active' : ''}`}
              type="button"
              aria-pressed={viewMode === 'week'}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button
              className={`focus-ring ${viewMode === 'month' ? 'is-active' : ''}`}
              type="button"
              aria-pressed={viewMode === 'month'}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
            <button
              className={`focus-ring ${viewMode === 'agenda' ? 'is-active' : ''}`}
              type="button"
              aria-pressed={viewMode === 'agenda'}
              onClick={() => setViewMode('agenda')}
            >
              Agenda
            </button>
          </div>
          <button
            className="agent-button focus-ring"
            type="button"
            onClick={() => setAgentOpen(true)}
          >
            <Sparkles size={15} />
            <span>GenMail Agent</span>
          </button>
        </div>
      </header>

      {agentOpen && (
        <>
          <button
            className="agent-scrim"
            type="button"
            aria-label="Close GenMail Agent"
            onClick={() => setAgentOpen(false)}
          />
          <aside className="agent-panel" aria-label="GenMail Agent">
            <div className="agent-panel-header">
              <div className="agent-title-icon">
                <Sparkles size={18} />
              </div>
              <div>
                <h2>GenMail Agent</h2>
                <p>Your calendar copilot</p>
              </div>
              <button
                className="agent-close focus-ring"
                type="button"
                aria-label="Close GenMail Agent"
                onClick={() => setAgentOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <p className="agent-helper">
              Ask me to understand your schedule, uncover open time, or prepare for what comes next.
            </p>
            <div className="agent-chips">
              {ACTIONS.map((action) => (
                <button
                  className={`focus-ring ${agentAction === action ? 'is-active' : ''}`}
                  type="button"
                  key={action}
                  onClick={() => setAgentAction(action)}
                >
                  {action}
                </button>
              ))}
            </div>
            <div className="agent-response" aria-live="polite">
              <span>
                <Sparkles size={14} /> {agentAction}
              </span>
              <p>
                You have <strong>{summary.count} events</strong> this week totaling{' '}
                <strong>{summary.hours} meeting hours</strong>. Your busiest day is{' '}
                <strong>{summary.busiestDay}</strong>.
              </p>
              {agentAction === 'Find a meeting slot' && (
                <small>
                  A clear window starts after {minutesToTime(900)} on most visible weekdays.
                </small>
              )}
              {agentAction === 'Draft follow-ups' && (
                <small>
                  I found{' '}
                  {
                    visibleWeekEvents.filter((event) => /review|hands|follow/i.test(event.title))
                      .length
                  }{' '}
                  meetings that may need a follow-up.
                </small>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  )
}
