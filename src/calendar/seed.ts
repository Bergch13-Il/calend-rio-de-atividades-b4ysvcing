import type { CalendarAccount, CalendarEvent, EventPalette, PaletteDefinition } from './types'

export const ACCOUNT_SEED: CalendarAccount[] = [
  { id: 'outlook', email: 'alex@outlook.ai', color: '#8B5CF6', enabled: true },
  { id: 'personal', email: 'alex.personal@gmail.com', color: '#3B82F6', enabled: true },
  { id: 'company', email: 'alex@company.com', color: '#22C55E', enabled: true },
]

export const PALETTES: Record<EventPalette, PaletteDefinition> = {
  lavender: { name: 'Lavender', fill: '#E5E0FA', accent: '#7C3AED' },
  blue: { name: 'Blue', fill: '#DCEBFD', accent: '#3B82F6' },
  peach: { name: 'Peach', fill: '#FCE9D4', accent: '#F59E0B' },
  mint: { name: 'Mint', fill: '#D9F2E4', accent: '#10B981' },
  rose: { name: 'Rose', fill: '#FADCD8', accent: '#EF4444' },
}

export const EVENT_SEED: CalendarEvent[] = [
  {
    id: 'planning-sync',
    title: 'Planning sync',
    date: '2026-07-13',
    start: 570,
    end: 615,
    accountId: 'outlook',
    palette: 'lavender',
    location: '',
  },
  {
    id: 'mufg-agent365',
    title: 'MUFG x Agent365',
    date: '2026-07-13',
    start: 660,
    end: 720,
    accountId: 'personal',
    palette: 'blue',
    location: 'Microsoft Teams',
  },
  {
    id: 'design-review',
    title: 'Design review',
    date: '2026-07-14',
    start: 675,
    end: 735,
    accountId: 'company',
    palette: 'peach',
    location: 'Zoom',
  },
  {
    id: 'all-hands',
    title: 'All Hands Meeting',
    date: '2026-07-17',
    start: 660,
    end: 750,
    accountId: 'outlook',
    palette: 'mint',
    location: 'US Office & Shenzhen',
  },
  {
    id: 'one-on-one-dave',
    title: '1:1 with Dave',
    date: '2026-07-16',
    start: 780,
    end: 840,
    accountId: 'outlook',
    palette: 'lavender',
    location: '',
  },
  {
    id: 'follow-up',
    title: 'Follow-up',
    date: '2026-07-17',
    start: 855,
    end: 900,
    accountId: 'company',
    palette: 'rose',
    location: '',
  },
]
