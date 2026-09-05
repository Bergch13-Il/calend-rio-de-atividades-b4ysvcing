import { Check, GripHorizontal, MapPin, Trash2, Video, X } from 'lucide-react'
import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react'
import { useCalendar } from '../../calendar/CalendarContext'
import { dateFromKey, formatLongDate, minutesToTime } from '../../calendar/date-utils'
import { PALETTES } from '../../calendar/seed'
import type { CalendarEvent } from '../../calendar/types'

export interface DragGestureState {
  eventId: string
  type: 'move' | 'resize-top' | 'resize-bottom'
  originClientX: number
  originClientY: number
  originalStart: number
  originalEnd: number
  originalDate: string
  originalDayIndex: number
  targetStart: number
  targetEnd: number
  targetDayIndex: number
  targetDate: string
  // Posições contínuas em pixels relativos ao container do calendário
  currentRawX: number
  currentRawY: number
  currentRawHeight: number
}

interface EventBlockProps {
  event: CalendarEvent
  dayIndex: number
  dayCount: number
  hourHeight: number
  searchActive: boolean
  searchMatch: boolean
  accountEnabled: boolean
  isDragging?: boolean
  isLanded?: boolean
  onStartDrag?: (
    type: 'move' | 'resize-top' | 'resize-bottom',
    pointerEvent: ReactPointerEvent,
    event: CalendarEvent,
    dayIndex: number,
  ) => void
}

export function EventBlock({
  event,
  dayIndex,
  dayCount,
  hourHeight,
  searchActive,
  searchMatch,
  accountEnabled,
  isDragging = false,
  isLanded = false,
  onStartDrag,
}: EventBlockProps) {
  const { accounts, deleteEvent, openEdit } = useCalendar()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const blockRef = useRef<HTMLDivElement>(null)
  const palette = PALETTES[event.palette] ?? PALETTES.lavender
  const isDraggingRef = useRef(false)
  const account = accounts.find((item) => item.id === event.accountId) ?? accounts[0]
  const top = (event.start / 60) * hourHeight
  const height = Math.max(((event.end - event.start) / 60) * hourHeight, 26)

  useEffect(() => {
    if (!popoverOpen) return
    const onPointerDown = (pointerEvent: PointerEvent) => {
      if (!blockRef.current?.contains(pointerEvent.target as Node)) setPopoverOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [popoverOpen])

  const beginDrag = (
    type: 'move' | 'resize-top' | 'resize-bottom',
    pointerEvent: ReactPointerEvent,
  ) => {
    if (pointerEvent.button !== 0 && pointerEvent.pointerType === 'mouse') return
    pointerEvent.stopPropagation()
    setPopoverOpen(false)
    if (onStartDrag) {
      onStartDrag(type, pointerEvent, event, dayIndex)
    }
  }

  const compact = height < 56
  const veryCompact = height < 40
  const hasLocation = Boolean(event.location)
  const showChecks = event.title === 'All Hands Meeting'

  return (
    <div
      ref={blockRef}
      className={`calendar-event-wrap ${popoverOpen ? 'has-open-popover' : ''} ${
        accountEnabled ? '' : 'is-calendar-hidden'
      } ${isDragging ? 'is-drag-source' : ''} ${isLanded ? 'is-recently-landed' : ''}`}
      style={{
        top,
        height,
        left: `calc(${(dayIndex / dayCount) * 100}% + 4px)`,
        width: `calc(${100 / dayCount}% - 8px)`,
        zIndex: popoverOpen ? 30 : isLanded ? 10 : 4,
      }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={`${event.title}, ${minutesToTime(event.start)} to ${minutesToTime(event.end)}`}
        className={`calendar-event focus-ring ${
          searchActive ? (searchMatch ? 'is-search-match' : 'is-search-dimmed') : ''
        }`}
        style={{
          backgroundColor: palette.fill,
          borderLeftColor: palette.accent,
        }}
        onPointerDown={(pointerEvent) => {
          beginDrag('move', pointerEvent)
        }}
        onClick={() => {
          setPopoverOpen((open) => !open)
        }}
        onKeyDown={(keyboardEvent) => {
          if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
            keyboardEvent.preventDefault()
            setPopoverOpen(true)
          }
        }}
      >
        {/* Alça superior de redimensionamento */}
        <div
          className="event-resize-grip event-resize-top"
          role="separator"
          aria-orientation="horizontal"
          aria-label={`Redimensionar início de ${event.title}`}
          onPointerDown={(pointerEvent) => beginDrag('resize-top', pointerEvent)}
        >
          <span className="resize-handle-bar">
            <GripHorizontal size={10} className="resize-grip-icon" />
          </span>
        </div>

        <strong className="event-title">
          {showChecks && (
            <span className="event-checks">
              <Check size={10} />
              <Check size={10} />
            </span>
          )}
          {event.title}
        </strong>

        {!veryCompact && hasLocation && (
          <span className="event-subtitle">
            {event.location === 'Microsoft Teams' || event.location === 'Zoom' ? (
              <Video size={10} />
            ) : (
              <MapPin size={10} />
            )}
            {event.location}
          </span>
        )}

        {!compact && !hasLocation && (
          <span className="event-subtitle">
            {minutesToTime(event.start)} – {minutesToTime(event.end)}
          </span>
        )}

        {/* Alça inferior de redimensionamento */}
        <div
          className="event-resize-grip event-resize-bottom"
          role="separator"
          aria-orientation="horizontal"
          aria-label={`Redimensionar término de ${event.title}`}
          onPointerDown={(pointerEvent) => beginDrag('resize-bottom', pointerEvent)}
        >
          <span className="resize-handle-bar">
            <GripHorizontal size={10} className="resize-grip-icon" />
          </span>
        </div>
      </div>

      {popoverOpen && (
        <div
          className={`event-popover ${dayIndex >= dayCount - 2 ? 'align-right' : ''}`}
          onPointerDown={(event_) => event_.stopPropagation()}
        >
          <button
            className="popover-close focus-ring"
            type="button"
            aria-label="Close event details"
            onClick={() => setPopoverOpen(false)}
          >
            <X size={15} />
          </button>
          <span className="popover-accent" style={{ backgroundColor: palette.accent }} />
          <h3>{event.title}</h3>
          <p>{formatLongDate(dateFromKey(event.date))}</p>
          <p>
            {minutesToTime(event.start)} – {minutesToTime(event.end)}
          </p>
          <div className="popover-account">
            <span style={{ backgroundColor: account.color }} />
            {account.email}
          </div>
          <div className="popover-location">
            {event.location ? (
              <>
                <MapPin size={13} /> {event.location}
              </>
            ) : (
              <>
                <MapPin size={13} /> No location
              </>
            )}
          </div>
          <div className="popover-actions">
            <button
              className="popover-delete focus-ring"
              type="button"
              onClick={() => {
                setPopoverOpen(false)
                deleteEvent(event.id)
              }}
            >
              <Trash2 size={13} /> Delete
            </button>
            <button
              className="popover-edit focus-ring"
              type="button"
              onClick={() => {
                setPopoverOpen(false)
                openEdit(event.id)
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
