import { CalendarDays, Check, X } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import { useCalendar } from '../../calendar/CalendarContext'
import { dateKey, minutesToTime } from '../../calendar/date-utils'
import { PALETTES } from '../../calendar/seed'
import type {
  AccountId,
  CalendarEvent,
  EventInput,
  EventPalette,
  EventPrefill,
} from '../../calendar/types'

const TIME_OPTIONS = Array.from({ length: 97 }, (_, index) => index * 15)
const PALETTE_KEYS = Object.keys(PALETTES) as EventPalette[]

interface EventModalCardProps {
  event?: CalendarEvent
  prefill?: EventPrefill
  onClose: () => void
}

function EventModalCard({ event, prefill, onClose }: EventModalCardProps) {
  const { accounts, saveEvent, selectedDay } = useCalendar()
  const initial = useMemo<EventInput>(
    () => ({
      title: event?.title ?? '',
      date: event?.date ?? prefill?.date ?? dateKey(selectedDay),
      start: event?.start ?? prefill?.start ?? 540,
      end: event?.end ?? prefill?.end ?? 600,
      accountId: event?.accountId ?? prefill?.accountId ?? 'outlook',
      palette: event?.palette ?? prefill?.palette ?? 'lavender',
      location: event?.location ?? prefill?.location ?? '',
    }),
    [event, prefill, selectedDay],
  )
  const [form, setForm] = useState<EventInput>(initial)
  const [errors, setErrors] = useState<{ title?: string; time?: string }>({})
  const selectedAccount = accounts.find((account) => account.id === form.accountId)!

  const submit = (submitEvent: FormEvent) => {
    submitEvent.preventDefault()
    const nextErrors: { title?: string; time?: string } = {}
    if (!form.title.trim()) nextErrors.title = 'Title is required'
    if (form.end <= form.start) nextErrors.time = 'End time must be after start time'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    saveEvent({ ...form, title: form.title.trim(), location: form.location.trim() }, event?.id)
  }

  return (
    <div
      className="event-modal-layer"
      role="presentation"
      onMouseDown={(mouseEvent) => {
        if (mouseEvent.target === mouseEvent.currentTarget) onClose()
      }}
    >
      <form
        className="event-modal"
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-modal-title"
      >
        <div className="modal-header">
          <span className="modal-calendar-icon">
            <CalendarDays size={17} />
          </span>
          <div>
            <h2 id="event-modal-title">{event ? 'Edit event' : 'New event'}</h2>
            <p>
              {event
                ? 'Update the details for this activity.'
                : 'Add an activity to your calendar.'}
            </p>
          </div>
          <button
            className="modal-close focus-ring"
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <label className="form-field">
          <span>Title</span>
          <input
            autoFocus
            value={form.title}
            onChange={(changeEvent) => {
              setForm((current) => ({ ...current, title: changeEvent.target.value }))
              if (errors.title) setErrors((current) => ({ ...current, title: undefined }))
            }}
            placeholder="Event title"
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title && <small className="field-error">{errors.title}</small>}
        </label>

        <div className="form-row date-row">
          <label className="form-field">
            <span>Date</span>
            <input
              type="date"
              value={form.date}
              onChange={(changeEvent) =>
                setForm((current) => ({ ...current, date: changeEvent.target.value }))
              }
            />
          </label>
          <label className="form-field">
            <span>Start</span>
            <select
              value={form.start}
              onChange={(changeEvent) =>
                setForm((current) => ({ ...current, start: Number(changeEvent.target.value) }))
              }
            >
              {TIME_OPTIONS.slice(0, -1).map((minutes) => (
                <option value={minutes} key={minutes}>
                  {minutesToTime(minutes)}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>End</span>
            <select
              value={form.end}
              onChange={(changeEvent) => {
                setForm((current) => ({ ...current, end: Number(changeEvent.target.value) }))
                setErrors((current) => ({ ...current, time: undefined }))
              }}
            >
              {TIME_OPTIONS.slice(1).map((minutes) => (
                <option value={minutes} key={minutes}>
                  {minutes === 1440 ? '12:00 AM (next day)' : minutesToTime(minutes)}
                </option>
              ))}
            </select>
          </label>
        </div>
        {errors.time && <small className="field-error time-error">{errors.time}</small>}

        <div className="form-row details-row">
          <label className="form-field calendar-select-field">
            <span>Calendar</span>
            <i style={{ backgroundColor: selectedAccount.color }} />
            <select
              value={form.accountId}
              onChange={(changeEvent) =>
                setForm((current) => ({
                  ...current,
                  accountId: changeEvent.target.value as AccountId,
                }))
              }
            >
              {accounts.map((account) => (
                <option value={account.id} key={account.id}>
                  {account.email}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Location</span>
            <input
              value={form.location}
              onChange={(changeEvent) =>
                setForm((current) => ({ ...current, location: changeEvent.target.value }))
              }
              placeholder="Microsoft Teams, Zoom..."
            />
          </label>
        </div>

        <fieldset className="color-fieldset">
          <legend>Color</legend>
          <div className="color-swatches">
            {PALETTE_KEYS.map((paletteKey) => (
              <button
                className={`color-swatch focus-ring ${form.palette === paletteKey ? 'is-selected' : ''}`}
                type="button"
                key={paletteKey}
                title={PALETTES[paletteKey].name}
                aria-label={`${PALETTES[paletteKey].name} color`}
                aria-pressed={form.palette === paletteKey}
                style={{
                  backgroundColor: PALETTES[paletteKey].fill,
                  borderColor: PALETTES[paletteKey].accent,
                }}
                onClick={() => setForm((current) => ({ ...current, palette: paletteKey }))}
              >
                {form.palette === paletteKey && (
                  <Check size={14} style={{ color: PALETTES[paletteKey].accent }} />
                )}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="modal-actions">
          <button className="modal-cancel focus-ring" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-save focus-ring" type="submit">
            Save
          </button>
        </div>
      </form>
    </div>
  )
}

export function EventModal() {
  const { closeModal, events, modal } = useCalendar()
  if (!modal) return null
  const event = modal.mode === 'edit' ? events.find((item) => item.id === modal.eventId) : undefined
  const prefill = modal.mode === 'create' ? modal.prefill : undefined
  return (
    <EventModalCard
      key={event?.id ?? `create-${prefill?.date ?? 'default'}-${prefill?.start ?? ''}`}
      event={event}
      prefill={prefill}
      onClose={closeModal}
    />
  )
}

export function ToastViewport() {
  const { toast } = useCalendar()
  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {toast && (
        <div className="calendar-toast" key={toast.id}>
          <Check size={14} />
          {toast.message}
        </div>
      )}
    </div>
  )
}
