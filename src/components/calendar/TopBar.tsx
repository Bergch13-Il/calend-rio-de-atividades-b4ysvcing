import { Menu, Search, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useCalendar } from '../../calendar/CalendarContext'

export function TopBar() {
  const { searchQuery, setSearchQuery, setMobileSidebarOpen } = useCalendar()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && document.activeElement !== inputRef.current) {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <header className="top-bar">
      <div className="presence-wrap" aria-label="Online">
        <span className="presence-dot" />
      </div>
      <button
        className="mobile-menu-button focus-ring"
        type="button"
        aria-label="Open calendars"
        onClick={() => setMobileSidebarOpen(true)}
      >
        <Menu size={18} />
      </button>
      <label className="global-search">
        <Search size={14} aria-hidden="true" />
        <input
          ref={inputRef}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setSearchQuery('')
              event.currentTarget.blur()
            }
          }}
          placeholder="Search mail, contacts..."
          aria-label="Search mail, contacts"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
            className="search-clear focus-ring"
          >
            <X size={13} />
          </button>
        )}
      </label>
    </header>
  )
}
