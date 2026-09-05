import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { ACCOUNT_SEED, EVENT_SEED } from './seed'
import { addDays, addMonths, dateFromKey, FIDELITY_NOW, startOfWeek } from './date-utils'
import type {
  AccountId,
  CalendarAccount,
  CalendarEvent,
  EventInput,
  EventModalState,
  EventPrefill,
  ViewMode,
} from './types'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastMessage {
  id: number
  message: string
  action?: ToastAction
}

interface CalendarContextValue {
  currentWeekStart: Date
  selectedDay: Date
  viewMode: ViewMode
  accounts: CalendarAccount[]
  events: CalendarEvent[]
  now: Date
  searchQuery: string
  sidebarCollapsed: boolean
  mobileSidebarOpen: boolean
  miniMonth: Date
  modal: EventModalState
  toast: ToastMessage | null
  agentOpen: boolean
  timezone: 'PDT' | 'JST'
  weekAnimationKey: number
  scrollRequest: number
  setSearchQuery: (value: string) => void
  setViewMode: (value: ViewMode) => void
  setSelectedDay: (date: Date) => void
  setSidebarCollapsed: (value: boolean | ((previous: boolean) => boolean)) => void
  setMobileSidebarOpen: (value: boolean) => void
  setMiniMonth: (date: Date) => void
  setAgentOpen: (value: boolean) => void
  setTimezone: (value: 'PDT' | 'JST') => void
  navigateWeek: (amount: number) => void
  jumpToDate: (date: Date, focusDay?: boolean) => void
  goToday: () => void
  navigateMonth: (amount: number) => void
  toggleAccount: (id: AccountId) => void
  openCreate: (prefill?: EventPrefill) => void
  openEdit: (eventId: string) => void
  closeModal: () => void
  saveEvent: (input: EventInput, eventId?: string) => void
  deleteEvent: (eventId: string) => void
  updateEventTime: (
    eventId: string,
    start: number,
    end: number,
    date?: string,
    options?: { previousState?: { date: string; start: number; end: number }; message?: string },
  ) => void
  undoLastChange: () => void
  showToast: (message: string, action?: ToastAction) => void
}

const CalendarContext = createContext<CalendarContextValue | null>(null)

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(FIDELITY_NOW))
  const [selectedDay, setSelectedDayState] = useState(() => new Date(FIDELITY_NOW))
  const [viewMode, setViewModeState] = useState<ViewMode>('week')
  const [accounts, setAccounts] = useState(() => ACCOUNT_SEED.map((account) => ({ ...account })))
  const [events, setEvents] = useState(() => EVENT_SEED.map((event) => ({ ...event })))
  const [now, setNow] = useState(() => new Date(FIDELITY_NOW))
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= 1024,
  )
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [miniMonth, setMiniMonth] = useState(() => new Date(2026, 6, 1))
  const [modal, setModal] = useState<EventModalState>(null)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [agentOpen, setAgentOpen] = useState(false)
  const [timezone, setTimezone] = useState<'PDT' | 'JST'>('PDT')
  const [weekAnimationKey, setWeekAnimationKey] = useState(0)
  const [scrollRequest, setScrollRequest] = useState(0)
  const lastStateBeforeEdit = useRef<{
    eventId: string
    date: string
    start: number
    end: number
  } | null>(null)
  const toastTimer = useRef<number | null>(null)
  const clockStartedAt = useRef(Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date(FIDELITY_NOW.getTime() + (Date.now() - clockStartedAt.current)))
    }, 60_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 640) {
        setViewModeState('day')
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current)
    },
    [],
  )

  const showToast = useCallback((message: string, action?: ToastAction) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    const next = { id: Date.now(), message, action }
    setToast(next)
    const duration = action ? 5000 : 2500
    toastTimer.current = window.setTimeout(() => setToast(null), duration)
  }, [])

  const undoLastChange = useCallback(() => {
    const last = lastStateBeforeEdit.current
    if (!last) return
    setEvents((current) =>
      current.map((event) =>
        event.id === last.eventId
          ? { ...event, date: last.date, start: last.start, end: last.end }
          : event,
      ),
    )
    lastStateBeforeEdit.current = null
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    setToast({
      id: Date.now(),
      message: 'Ajuste desfeito',
    })
    toastTimer.current = window.setTimeout(() => setToast(null), 2500)
  }, [])

  const animateWeek = useCallback(() => setWeekAnimationKey((key) => key + 1), [])

  const navigateWeek = useCallback(
    (amount: number) => {
      setCurrentWeekStart((previous) => {
        const next = addDays(previous, amount * 7)
        setSelectedDayState((day) => addDays(day, amount * 7))
        setMiniMonth(new Date(next.getFullYear(), next.getMonth(), 1))
        return next
      })
      animateWeek()
    },
    [animateWeek],
  )

  const jumpToDate = useCallback(
    (date: Date, focusDay = false) => {
      setCurrentWeekStart(startOfWeek(date))
      setSelectedDayState(new Date(date))
      setMiniMonth(new Date(date.getFullYear(), date.getMonth(), 1))
      if (focusDay) setViewModeState('day')
      setMobileSidebarOpen(false)
      animateWeek()
    },
    [animateWeek],
  )

  const goToday = useCallback(() => {
    jumpToDate(now)
    setScrollRequest((request) => request + 1)
  }, [jumpToDate, now])

  const setSelectedDay = useCallback((date: Date) => {
    setSelectedDayState(new Date(date))
    setCurrentWeekStart(startOfWeek(date))
  }, [])

  const setViewMode = useCallback((value: ViewMode) => {
    setViewModeState(value)
  }, [])

  const navigateMonth = useCallback((amount: number) => {
    setMiniMonth((month) => addMonths(month, amount))
  }, [])

  const toggleAccount = useCallback((id: AccountId) => {
    setAccounts((current) =>
      current.map((account) =>
        account.id === id ? { ...account, enabled: !account.enabled } : account,
      ),
    )
  }, [])

  const openCreate = useCallback((prefill?: EventPrefill) => {
    setModal({ mode: 'create', prefill })
  }, [])

  const openEdit = useCallback((eventId: string) => {
    setModal({ mode: 'edit', eventId })
  }, [])

  const closeModal = useCallback(() => setModal(null), [])

  const saveEvent = useCallback(
    (input: EventInput, eventId?: string) => {
      if (eventId) {
        setEvents((current) =>
          current.map((event) => (event.id === eventId ? { ...event, ...input } : event)),
        )
        showToast('Event updated')
      } else {
        const nextEvent: CalendarEvent = {
          ...input,
          id: `event-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        }
        setEvents((current) => [...current, nextEvent])
        const eventDate = dateFromKey(input.date)
        setCurrentWeekStart(startOfWeek(eventDate))
        setSelectedDayState(eventDate)
        showToast('Event created')
      }
      setModal(null)
    },
    [showToast],
  )

  const deleteEvent = useCallback(
    (eventId: string) => {
      setEvents((current) => current.filter((event) => event.id !== eventId))
      showToast('Event deleted')
    },
    [showToast],
  )

  const updateEventTime = useCallback(
    (
      eventId: string,
      start: number,
      end: number,
      newDate?: string,
      options?: {
        previousState?: { date: string; start: number; end: number }
        message?: string
      },
    ) => {
      setEvents((current) =>
        current.map((event) => {
          if (event.id !== eventId) return event
          const date = newDate ?? event.date
          return { ...event, start, end, date }
        }),
      )

      if (options?.previousState) {
        lastStateBeforeEdit.current = {
          eventId,
          ...options.previousState,
        }
      }

      if (options?.message) {
        showToast(options.message, {
          label: 'Desfazer',
          onClick: undoLastChange,
        })
      }
    },
    [showToast, undoLastChange],
  )

  const value = useMemo<CalendarContextValue>(
    () => ({
      currentWeekStart,
      selectedDay,
      viewMode,
      accounts,
      events,
      now,
      searchQuery,
      sidebarCollapsed,
      mobileSidebarOpen,
      miniMonth,
      modal,
      toast,
      agentOpen,
      timezone,
      weekAnimationKey,
      scrollRequest,
      setSearchQuery,
      setViewMode,
      setSelectedDay,
      setSidebarCollapsed,
      setMobileSidebarOpen,
      setMiniMonth,
      setAgentOpen,
      setTimezone,
      navigateWeek,
      jumpToDate,
      goToday,
      navigateMonth,
      toggleAccount,
      openCreate,
      openEdit,
      closeModal,
      saveEvent,
      deleteEvent,
      updateEventTime,
      undoLastChange,
      showToast,
    }),
    [
      accounts,
      agentOpen,
      closeModal,
      currentWeekStart,
      deleteEvent,
      events,
      goToday,
      jumpToDate,
      miniMonth,
      mobileSidebarOpen,
      modal,
      navigateMonth,
      navigateWeek,
      now,
      openCreate,
      openEdit,
      saveEvent,
      scrollRequest,
      searchQuery,
      selectedDay,
      setSelectedDay,
      setViewMode,
      sidebarCollapsed,
      timezone,
      toast,
      toggleAccount,
      updateEventTime,
      undoLastChange,
      showToast,
      viewMode,
      weekAnimationKey,
    ],
  )

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>
}

export function useCalendar() {
  const context = useContext(CalendarContext)
  if (!context) throw new Error('useCalendar must be used inside CalendarProvider')
  return context
}
