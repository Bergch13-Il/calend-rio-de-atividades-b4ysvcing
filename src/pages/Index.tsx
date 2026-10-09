import { useEffect } from 'react'
import Layout from '../components/Layout'
import { CalendarGrid } from '../components/calendar/CalendarGrid'
import { CalendarHeaders } from '../components/calendar/CalendarHeaders'
import { CalendarToolbar } from '../components/calendar/CalendarToolbar'
import { MonthView } from '../components/calendar/MonthView'
import { AgendaView } from '../components/calendar/AgendaView'
import { EventModal, ToastViewport } from '../components/calendar/EventModal'
import { CalendarProvider, useCalendar } from '../calendar/CalendarContext'

function CalendarWorkspace() {
  const { navigateDate, modal, viewMode } = useCalendar()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.matches('input, textarea, select') || modal) return
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        navigateDate(-1)
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        navigateDate(1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [modal, navigateDate])

  return (
    <>
      <Layout>
        <section className={`calendar-workspace view-${viewMode}`} aria-label="Calendar">
          <CalendarToolbar />
          {(viewMode === 'day' || viewMode === 'week') && <CalendarHeaders />}
          {viewMode === 'month' && <MonthView />}
          {viewMode === 'agenda' && <AgendaView />}
          {(viewMode === 'day' || viewMode === 'week') && <CalendarGrid />}
        </section>
      </Layout>
      <EventModal />
      <ToastViewport />
    </>
  )
}

export default function Index() {
  return (
    <CalendarProvider>
      <CalendarWorkspace />
    </CalendarProvider>
  )
}
