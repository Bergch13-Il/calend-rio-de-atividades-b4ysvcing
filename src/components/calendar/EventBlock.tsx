import { Check, MapPin, Trash2, Video, X } from 'lucide-react'
import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react'
import { useCalendar } from '../../calendar/CalendarContext'
import { dateFromKey, formatLongDate, minutesToTime, snapMinutes } from '../../calendar/date-utils'
import { PALETTES } from '../../calendar/seed'
import type { CalendarEvent } from '../../calendar/types'

interface EventBlockProps {
  event: CalendarEvent
  dayIndex: number
  dayCount: number
  hourHeight: number
  searchActive: boolean
  searchMatch: boolean
  accountEnabled: boolean
}

type Gesture = { type: 'move' | 'resize'; originY: number; start: number; end: number } | null

export function EventBlock({
  event,
  dayIndex,
  dayCount,
  hourHeight,
  searchActive,
  searchMatch,
  accountEnabled,
}: EventBlockProps) {
  const { accounts, deleteEvent, openEdit, updateEventTime } = useCalendar()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [gesture, setGesture] = useState<Gesture>(null)
  const [draftTime, setDraftTime] = useState({ start: event.start, end: event.end })
  const moved = useRef(false)
  const blockRef = useRef<HTMLDivElement>(null)
  const palette = PALETTES[event.palette]
  const account = accounts.find((item) => item.id === event.accountId)!
  const top = (draftTime.start / 60) * hourHeight
  const height = Math.max(((draftTime.end - draftTime.start) / 60) * hourHeight, 24)

  useEffect(() => setDraftTime({ start: event.start, end: event.end }), [event.end, event.start])

  useEffect(() => {
    if (!gesture) return
    const onMove = (pointerEvent: PointerEvent) => {
      const delta = snapMinutes(((pointerEvent.clientY - gesture.originY) / hourHeight) * 60)
      moved.current = moved.current || Math.abs(pointerEvent.clientY - gesture.originY) > 3
      if (gesture.type === 'move') {
        const duration = gesture.end - gesture.start
        const nextStart = Math.max(0, Math.min(1440 - duration, gesture.start + delta))
        setDraftTime({ start: nextStart, end: nextStart + duration })
      } else {
        const nextEnd = Math.max(gesture.start + 15, Math.min(1440, gesture.end + delta))
        setDraftTime({ start: gesture.start, end: nextEnd })
      }
    }
    const onUp = () => {
      if (moved.current) updateEventTime(event.id, draftTime.start, draftTime.end)
      setGesture(null)
      window.setTimeout(() => {
        moved.current = false
      }, 0)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp, { once: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [draftTime.end, draftTime.start, event.id, gesture, hourHeight, updateEventTime])

  useEffect(() => {
    if (!popoverOpen) return
    const onPointerDown = (pointerEvent: PointerEvent) => {
      if (!blockRef.current?.contains(pointerEvent.target as Node)) setPopoverOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [popoverOpen])

  const beginGesture = (type: 'move' | 'resize', pointerEvent: ReactPointerEvent) => {
    if (pointerEvent.button !== 0) return
    pointerEvent.stopPropagation()
    setPopoverOpen(false)
    moved.current = false
    setGesture({ type, originY: pointerEvent.clientY, start: draftTime.start, end: draftTime.end })
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
      }`}
      style={{
        top,
        height,
        left: `calc(${(dayIndex / dayCount) * 100}% + 5px)`,
        width: `calc(${100 / dayCount}% - 10px)`,
        zIndex: gesture ? 18 : popoverOpen ? 30 : 4,
      }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={`${event.title}, ${minutesToTime(draftTime.start)} to ${minutesToTime(draftTime.end)}`}
        className={`calendar-event focus-ring ${gesture ? 'is-dragging' : ''} ${
          searchActive ? (searchMatch ? 'is-search-match' : 'is-search-dimmed') : ''
        }`}
        style={{ backgroundColor: palette.fill, borderLeftColor: palette.accent }}
        onPointerDown={(pointerEvent) => beginGesture('move', pointerEvent)}
        onClick={() => {
          if (!moved.current) setPopoverOpen((open) => !open)
        }}
        onKeyDown={(keyboardEvent) => {
          if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
            keyboardEvent.preventDefault()
            setPopoverOpen(true)
          }
        }}
      >
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
            {minutesToTime(draftTime.start)} – {minutesToTime(draftTime.end)}
          </span>
        )}
        <span
          className="event-resize-handle"
          role="separator"
          aria-orientation="horizontal"
          aria-label={`Resize ${event.title}`}
          onPointerDown={(pointerEvent) => beginGesture('resize', pointerEvent)}
        />
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
