import type { CalendarAccount, CalendarEvent, EventPalette, PaletteDefinition } from './types'

export const ACCOUNT_SEED: CalendarAccount[] = [
  { id: 'outlook', email: 'alex@outlook.ai', color: '#8B5CF6', enabled: true },
  { id: 'personal', email: 'alex.personal@gmail.com', color: '#3B82F6', enabled: true },
  { id: 'company', email: 'alex@company.com', color: '#22C55E', enabled: true },
]

export const PALETTES: Record<EventPalette, PaletteDefinition> = {
  // 5 tons originais do print de referência (mantidos com exatidão)
  lavender: { name: 'Lavender', fill: '#E5E0FA', accent: '#7C3AED' },
  blue: { name: 'Blue', fill: '#DCEBFD', accent: '#3B82F6' },
  peach: { name: 'Peach', fill: '#FCE9D4', accent: '#F59E0B' },
  mint: { name: 'Mint', fill: '#D9F2E4', accent: '#10B981' },
  rose: { name: 'Rose', fill: '#FADCD8', accent: '#EF4444' },

  // +15 tons pastéis suaves com barra de accent em tom mais forte
  lilac: { name: 'Lilac', fill: '#EDE4F7', accent: '#9333EA' },
  sky: { name: 'Sky', fill: '#E0F2FE', accent: '#0284C7' },
  cyan: { name: 'Cyan', fill: '#E0F7FA', accent: '#0891B2' },
  teal: { name: 'Teal', fill: '#CCFBF1', accent: '#0D9488' },
  sage: { name: 'Sage', fill: '#E2F1E8', accent: '#059669' },
  lime: { name: 'Lime', fill: '#ECFCCB', accent: '#65A30D' },
  lemon: { name: 'Lemon', fill: '#FEF9C3', accent: '#CA8A04' },
  banana: { name: 'Banana', fill: '#FEF3C7', accent: '#D97706' },
  amber: { name: 'Amber', fill: '#FFEDD5', accent: '#EA580C' },
  apricot: { name: 'Apricot', fill: '#FFE4E6', accent: '#E11D48' },
  coral: { name: 'Coral', fill: '#FFEBE7', accent: '#F43F5E' },
  bubblegum: { name: 'Bubblegum', fill: '#FCE7F3', accent: '#DB2777' },
  berry: { name: 'Berry', fill: '#F3E8FF', accent: '#C026D3' },
  warmgray: { name: 'Warm Gray', fill: '#F5EFEB', accent: '#78716C' },
  slate: { name: 'Slate', fill: '#E2E8F0', accent: '#475569' },
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
