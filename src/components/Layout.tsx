import type { ReactNode } from 'react'
import { Sidebar } from './calendar/Sidebar'
import { TopBar } from './calendar/TopBar'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <TopBar />
      <div className="app-lower-shell">
        <Sidebar />
        <main className="calendar-main">{children}</main>
      </div>
    </div>
  )
}

export default Layout
