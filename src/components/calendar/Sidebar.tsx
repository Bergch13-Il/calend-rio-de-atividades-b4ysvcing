import {
  Check,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  X,
} from 'lucide-react'
import { useCalendar } from '../../calendar/CalendarContext'
import {
  dateKey,
  formatMonthTitle,
  getMonthCells,
  sameDay,
  sameWeek,
} from '../../calendar/date-utils'

const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function Sidebar() {
  const {
    accounts,
    currentWeekStart,
    jumpToDate,
    miniMonth,
    mobileSidebarOpen,
    navigateMonth,
    now,
    openCreate,
    sidebarCollapsed,
    setMobileSidebarOpen,
    setSidebarCollapsed,
    toggleAccount,
  } = useCalendar()
  const monthCells = getMonthCells(miniMonth)

  return (
    <>
      {mobileSidebarOpen && (
        <button
          className="sidebar-scrim"
          type="button"
          aria-label="Close calendars"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <aside
        className={`calendar-sidebar ${sidebarCollapsed ? 'is-collapsed' : ''} ${
          mobileSidebarOpen ? 'is-mobile-open' : ''
        }`}
      >
        <div className="sidebar-actions">
          <button
            className="sidebar-collapse focus-ring"
            type="button"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setSidebarCollapsed((previous) => !previous)}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
          <button
            className="new-event-button focus-ring"
            type="button"
            onClick={() => openCreate()}
          >
            <Plus size={16} strokeWidth={2.4} />
            <span>New event</span>
          </button>
          <button
            className="sidebar-mobile-close focus-ring"
            type="button"
            aria-label="Close sidebar"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-expanded-content">
          <section className="mini-calendar" aria-label={formatMonthTitle(miniMonth)}>
            <div className="mini-calendar-title-row">
              <h2>{formatMonthTitle(miniMonth)}</h2>
              <div>
                <button
                  className="sidebar-icon-button focus-ring"
                  type="button"
                  aria-label="Previous month"
                  onClick={() => navigateMonth(-1)}
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  className="sidebar-icon-button focus-ring"
                  type="button"
                  aria-label="Next month"
                  onClick={() => navigateMonth(1)}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            <div className="mini-weekdays" aria-hidden="true">
              {WEEKDAY_LETTERS.map((letter, index) => (
                <span key={`${letter}-${index}`}>{letter}</span>
              ))}
            </div>
            <div className="mini-days" key={`${miniMonth.getFullYear()}-${miniMonth.getMonth()}`}>
              {monthCells.map((date) => {
                const outsideMonth = date.getMonth() !== miniMonth.getMonth()
                const inVisibleWeek = sameWeek(date, currentWeekStart)
                const isToday = sameDay(date, now)
                return (
                  <button
                    className={`mini-day focus-ring ${outsideMonth ? 'is-outside' : ''} ${
                      inVisibleWeek ? 'is-visible-week' : ''
                    } ${isToday ? 'is-today' : ''}`}
                    type="button"
                    key={dateKey(date)}
                    aria-label={date.toDateString()}
                    aria-current={isToday ? 'date' : undefined}
                    onClick={() => jumpToDate(date)}
                  >
                    <span>{date.getDate()}</span>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="account-list" aria-labelledby="calendar-list-title">
            <h2 id="calendar-list-title">MY CALENDARS</h2>
            {accounts.map((account) => (
              <label className="account-row" key={account.id}>
                <input
                  type="checkbox"
                  checked={account.enabled}
                  onChange={() => toggleAccount(account.id)}
                />
                <span
                  className="account-checkbox"
                  style={{
                    backgroundColor: account.enabled ? account.color : 'transparent',
                    borderColor: account.color,
                  }}
                >
                  {account.enabled && <Check size={11} strokeWidth={3} />}
                </span>
                <span className="account-email">{account.email}</span>
              </label>
            ))}
          </section>
        </div>
      </aside>
    </>
  )
}
