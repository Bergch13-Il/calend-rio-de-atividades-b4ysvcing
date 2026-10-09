export type ViewMode = 'day' | 'week' | 'month' | 'agenda'
export type AccountId = 'outlook' | 'personal' | 'company'
export type EventPalette =
  | 'lavender'
  | 'blue'
  | 'peach'
  | 'mint'
  | 'rose'
  | 'lilac'
  | 'sky'
  | 'cyan'
  | 'teal'
  | 'sage'
  | 'lime'
  | 'lemon'
  | 'banana'
  | 'amber'
  | 'apricot'
  | 'coral'
  | 'bubblegum'
  | 'berry'
  | 'warmgray'
  | 'slate'

export interface CalendarAccount {
  id: AccountId
  email: string
  color: string
  enabled: boolean
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  start: number
  end: number
  accountId: AccountId
  palette: EventPalette
  location: string
}

export interface EventInput {
  title: string
  date: string
  start: number
  end: number
  accountId: AccountId
  palette: EventPalette
  location: string
}

export interface EventPrefill {
  date?: string
  start?: number
  end?: number
  accountId?: AccountId
  palette?: EventPalette
  location?: string
}

export type EventModalState =
  | { mode: 'create'; prefill?: EventPrefill }
  | { mode: 'edit'; eventId: string }
  | null

export interface PaletteDefinition {
  name: string
  fill: string
  accent: string
}
