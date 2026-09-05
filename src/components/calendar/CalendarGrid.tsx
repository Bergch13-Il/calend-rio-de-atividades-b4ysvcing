import { type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useCalendar } from '../../calendar/CalendarContext'
import {
  addDays,
  dateFromKey,
  dateKey,
  formatShortDatePt,
  getWeekDays,
  hourLabel,
  minutesToTime,
  sameDay,
  snapMinutes,
} from '../../calendar/date-utils'
import { PALETTES } from '../../calendar/seed'
import type { CalendarEvent } from '../../calendar/types'
import { type DragGestureState, EventBlock } from './EventBlock'

const HOUR_HEIGHT = 62
const DAY_HEIGHT = HOUR_HEIGHT * 24

interface SlotSelection {
  dayIndex: number
  anchor: number
  current: number
  moved: boolean
}

export function CalendarGrid() {
  const {
    accounts,
    currentWeekStart,
    events,
    now,
    openCreate,
    scrollRequest,
    searchQuery,
    selectedDay,
    setSelectedDay,
    updateEventTime,
    viewMode,
  } = useCalendar()
  const scrollRef = useRef<HTMLDivElement>(null)
  const daysRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const [selection, setSelection] = useState<SlotSelection | null>(null)
  const [activeDrag, setActiveDrag] = useState<DragGestureState | null>(null)
  const weekDays = getWeekDays(currentWeekStart)
  const visibleDays = viewMode === 'week' ? weekDays : [selectedDay]
  const enabledAccounts = new Set(
    accounts.filter((account) => account.enabled).map((account) => account.id),
  )
  const normalizedSearch = searchQuery.trim().toLocaleLowerCase()

  useEffect(() => {
    const viewport = scrollRef.current
    if (!viewport) return
    const nowIsVisible = visibleDays.some((day) => sameDay(day, now))
    const targetHour =
      scrollRequest > 0 && nowIsVisible
        ? Math.max(0, now.getHours() + now.getMinutes() / 60 - 2)
        : 9
    viewport.scrollTo({
      top: targetHour * HOUR_HEIGHT,
      behavior: scrollRequest > 0 ? 'smooth' : 'auto',
    })
  }, [scrollRequest, viewMode])

  const visibleEvents = useMemo(() => {
    const visibleKeys = new Set(visibleDays.map(dateKey))
    return events.filter((event) => visibleKeys.has(event.date))
  }, [events, visibleDays])

  useEffect(() => {
    if (!selection) return
    const onPointerMove = (pointerEvent: PointerEvent) => {
      const container = daysRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const minutes = Math.max(
        0,
        Math.min(1440, snapMinutes(((pointerEvent.clientY - rect.top) / HOUR_HEIGHT) * 60)),
      )
      setSelection((current) =>
        current
          ? {
              ...current,
              current: minutes,
              moved: current.moved || Math.abs(minutes - current.anchor) >= 15,
            }
          : null,
      )
    }
    const onPointerUp = () => {
      setSelection((current) => {
        if (!current) return null
        const day = visibleDays[current.dayIndex]
        const lower = Math.min(current.anchor, current.current)
        const upper = Math.max(current.anchor, current.current)
        const start = Math.min(lower, 1425)
        const end = current.moved ? Math.max(start + 15, upper) : Math.min(1440, start + 60)
        openCreate({ date: dateKey(day), start, end })
        return null
      })
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp, { once: true })
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [openCreate, selection, visibleDays])

  const beginSlotSelection = (pointerEvent: React.PointerEvent<HTMLDivElement>) => {
    if (pointerEvent.button !== 0 || pointerEvent.target !== pointerEvent.currentTarget) return
    const rect = pointerEvent.currentTarget.getBoundingClientRect()
    const rawDay = Math.floor(
      ((pointerEvent.clientX - rect.left) / rect.width) * visibleDays.length,
    )
    const dayIndex = Math.max(0, Math.min(visibleDays.length - 1, rawDay))
    const minutes = Math.max(
      0,
      Math.min(1425, snapMinutes(((pointerEvent.clientY - rect.top) / HOUR_HEIGHT) * 60)),
    )
    setSelection({ dayIndex, anchor: minutes, current: minutes, moved: false })
  }

  // Drag and drop & Resize handling
  const activeEvent = useMemo(
    () => (activeDrag ? events.find((e) => e.id === activeDrag.eventId) : null),
    [activeDrag, events],
  )

  const handleStartDrag = (
    type: 'move' | 'resize-top' | 'resize-bottom',
    pointerEvent: ReactPointerEvent,
    event: CalendarEvent,
    dayIndex: number,
  ) => {
    const targetDate = dateKey(visibleDays[dayIndex])
    setActiveDrag({
      eventId: event.id,
      type,
      originClientX: pointerEvent.clientX,
      originClientY: pointerEvent.clientY,
      originalStart: event.start,
      originalEnd: event.end,
      originalDate: event.date,
      originalDayIndex: dayIndex,
      targetStart: event.start,
      targetEnd: event.end,
      targetDayIndex: dayIndex,
      targetDate,
    })
  }

  useEffect(() => {
    if (!activeDrag) return

    const onPointerMove = (e: PointerEvent) => {
      const container = daysRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()

      const deltaY = e.clientY - activeDrag.originClientY
      const deltaMinutes = snapMinutes((deltaY / HOUR_HEIGHT) * 60)

      if (activeDrag.type === 'move') {
        const duration = activeDrag.originalEnd - activeDrag.originalStart
        const clampedStart = Math.max(
          0,
          Math.min(1440 - duration, activeDrag.originalStart + deltaMinutes),
        )
        const clampedEnd = clampedStart + duration

        // Detectar coluna/dia alvo (se for semana, permite arrastar entre dias)
        let targetIndex = activeDrag.originalDayIndex
        if (visibleDays.length > 1) {
          const relativeX = e.clientX - rect.left
          const colWidth = rect.width / visibleDays.length
          const calcIndex = Math.floor(relativeX / colWidth)
          targetIndex = Math.max(0, Math.min(visibleDays.length - 1, calcIndex))
        }

        const targetDate = dateKey(visibleDays[targetIndex])

        setActiveDrag((prev) =>
          prev
            ? {
                ...prev,
                targetStart: clampedStart,
                targetEnd: clampedEnd,
                targetDayIndex: targetIndex,
                targetDate,
              }
            : null,
        )
      } else if (activeDrag.type === 'resize-bottom') {
        const nextEnd = Math.max(
          activeDrag.originalStart + 15,
          Math.min(1440, activeDrag.originalEnd + deltaMinutes),
        )
        setActiveDrag((prev) => (prev ? { ...prev, targetEnd: nextEnd } : null))
      } else if (activeDrag.type === 'resize-top') {
        const nextStart = Math.max(
          0,
          Math.min(activeDrag.originalEnd - 15, activeDrag.originalStart + deltaMinutes),
        )
        setActiveDrag((prev) => (prev ? { ...prev, targetStart: nextStart } : null))
      }
    }

    const onPointerUp = () => {
      setActiveDrag((current) => {
        if (!current) return null
        const hasChanged =
          current.targetStart !== current.originalStart ||
          current.targetEnd !== current.originalEnd ||
          current.targetDate !== current.originalDate

        if (hasChanged) {
          const targetDayDate = dateFromKey(current.targetDate)
          const formattedDay = formatShortDatePt(targetDayDate)
          const timeStart = minutesToTime(current.targetStart)
          const timeEnd = minutesToTime(current.targetEnd)

          let message = ''
          if (current.type === 'move') {
            if (current.targetDate !== current.originalDate) {
              message = `Evento movido para ${formattedDay} · ${timeStart}`
            } else {
              message = `Evento movido para ${timeStart}`
            }
          } else {
            message = `Horário ajustado para ${timeStart} – ${timeEnd}`
          }

          updateEventTime(
            current.eventId,
            current.targetStart,
            current.targetEnd,
            current.targetDate,
            {
              previousState: {
                date: current.originalDate,
                start: current.originalStart,
                end: current.originalEnd,
              },
              message,
            },
          )
        }
        return null
      })
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp, { once: true })
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [activeDrag, updateEventTime, visibleDays])

  const nowDayIndex = visibleDays.findIndex((day) => sameDay(day, now))
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  return (
    <div
      className={`calendar-grid ${viewMode === 'day' ? 'is-day-view' : ''}`}
      ref={scrollRef}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null
      }}
      onTouchEnd={(event) => {
        if (viewMode !== 'day' || touchStartX.current === null) return
        const delta =
          (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current
        if (Math.abs(delta) > 60) setSelectedDay(addDays(selectedDay, delta < 0 ? 1 : -1))
        touchStartX.current = null
      }}
    >
      <div className="grid-canvas" style={{ height: DAY_HEIGHT }}>
        <div className="time-gutter" aria-hidden="true">
          {Array.from({ length: 24 }, (_, hour) => (
            <span className="time-label" style={{ top: hour * HOUR_HEIGHT }} key={hour}>
              {hourLabel(hour)}
            </span>
          ))}
        </div>
        <div
          className="days-grid"
          ref={daysRef}
          style={{ '--visible-days': visibleDays.length } as React.CSSProperties}
          onPointerDown={beginSlotSelection}
        >
          {visibleDays.map((day, index) => (
            <div
              className={`day-column ${day.getDay() === 0 || day.getDay() === 6 ? 'is-weekend' : ''}`}
              style={{
                left: `${(index / visibleDays.length) * 100}%`,
                width: `${100 / visibleDays.length}%`,
              }}
              key={dateKey(day)}
            />
          ))}
          {Array.from({ length: 49 }, (_, halfHour) => (
            <span
              className={`grid-time-line ${halfHour % 2 === 0 ? 'is-hour' : 'is-half-hour'}`}
              style={{ top: halfHour * (HOUR_HEIGHT / 2) }}
              key={halfHour}
            />
          ))}
          {Array.from({ length: visibleDays.length + 1 }, (_, boundary) => (
            <span
              className="day-column-line"
              style={{ left: `${(boundary / visibleDays.length) * 100}%` }}
              key={boundary}
            />
          ))}

          {visibleEvents.map((event) => {
            const dayIndex = visibleDays.findIndex((day) => dateKey(day) === event.date)
            const accountEnabled = enabledAccounts.has(event.accountId)
            const searchMatch =
              !normalizedSearch || event.title.toLocaleLowerCase().includes(normalizedSearch)
            const isDraggingThis = activeDrag?.eventId === event.id
            return (
              <EventBlock
                key={event.id}
                event={event}
                dayIndex={dayIndex}
                dayCount={visibleDays.length}
                hourHeight={HOUR_HEIGHT}
                searchActive={Boolean(normalizedSearch)}
                searchMatch={searchMatch}
                accountEnabled={accountEnabled}
                isDragging={isDraggingThis}
                onStartDrag={handleStartDrag}
              />
            )
          })}

          {/* Ghost / visual feedback de drag & resize */}
          {activeDrag && activeEvent && (
            <div
              className={`event-drag-ghost ${activeDrag.type.startsWith('resize') ? 'is-resizing' : 'is-moving'}`}
              style={{
                top: (activeDrag.targetStart / 60) * HOUR_HEIGHT,
                height: Math.max(
                  ((activeDrag.targetEnd - activeDrag.targetStart) / 60) * HOUR_HEIGHT,
                  26,
                ),
                left: `calc(${(activeDrag.targetDayIndex / visibleDays.length) * 100}% + 4px)`,
                width: `calc(${100 / visibleDays.length}% - 8px)`,
                backgroundColor: PALETTES[activeEvent.palette]?.fill ?? '#ede9fe',
                borderColor: PALETTES[activeEvent.palette]?.accent ?? '#7c3aed',
              }}
            >
              <div
                className="event-ghost-accent-bar"
                style={{
                  backgroundColor: PALETTES[activeEvent.palette]?.accent ?? '#7c3aed',
                }}
              />
              <div className="event-ghost-content">
                <span className="event-ghost-title">{activeEvent.title}</span>
                <span className="event-ghost-time-badge">
                  {minutesToTime(activeDrag.targetStart)} – {minutesToTime(activeDrag.targetEnd)}
                </span>
              </div>

              {/* Tooltip flutuante claro com horário atualizado durante o resize/move */}
              <div
                className={`drag-time-tooltip ${
                  activeDrag.type === 'resize-top'
                    ? 'tooltip-top'
                    : activeDrag.targetStart > 1320
                      ? 'tooltip-top'
                      : 'tooltip-bottom'
                }`}
              >
                {visibleDays.length > 1 && activeDrag.type === 'move' && (
                  <span className="tooltip-day-label">
                    {formatShortDatePt(visibleDays[activeDrag.targetDayIndex])} ·{' '}
                  </span>
                )}
                <strong>
                  {minutesToTime(activeDrag.targetStart)} – {minutesToTime(activeDrag.targetEnd)}
                </strong>
                <span className="tooltip-snap-hint"> (snap 15 min)</span>
              </div>
            </div>
          )}

          {selection && (
            <div
              className="slot-selection"
              style={{
                left: `calc(${(selection.dayIndex / visibleDays.length) * 100}% + 4px)`,
                width: `calc(${100 / visibleDays.length}% - 8px)`,
                top: (Math.min(selection.anchor, selection.current) / 60) * HOUR_HEIGHT,
                height: Math.max(
                  (Math.abs(selection.current - selection.anchor) / 60) * HOUR_HEIGHT,
                  HOUR_HEIGHT / 4,
                ),
              }}
            />
          )}

          {nowDayIndex >= 0 && (
            <div
              className="now-line"
              style={{
                left: `${(nowDayIndex / visibleDays.length) * 100}%`,
                width: `${100 / visibleDays.length}%`,
                top: (nowMinutes / 60) * HOUR_HEIGHT,
              }}
              aria-label={`Current time ${hourLabel(now.getHours())}`}
            >
              <span />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
