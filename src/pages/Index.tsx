import { useEffect } from 'react'
import Layout from '../components/Layout'
import { CalendarGrid } from '../components/calendar/CalendarGrid'
import { CalendarHeaders } from '../components/calendar/CalendarHeaders'
import { CalendarToolbar } from '../components/calendar/CalendarToolbar'
import { EventModal, ToastViewport } from '../components/calendar/EventModal'
import { CalendarProvider, useCalendar } from '../calendar/CalendarContext'

function CalendarWorkspace() {
  const { navigateWeek, modal } = useCalendar()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.matches('input, textarea, select') || modal) return
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        navigateWeek(-1)
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        navigateWeek(1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [modal, navigateWeek])

  return (
    <>
      <Layout>
        <section className="calendar-workspace" aria-label="Calendar">
          <CalendarToolbar />
          <CalendarHeaders />
          <CalendarGrid />
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
