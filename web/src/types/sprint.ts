import type { Ticket } from './ticket'

export type SprintStatus = 'draft' | 'active' | 'completed'

export type SprintDurationOption = 5 | 10 | 'custom'

export type Sprint = {
  id: string
  userId?: string
  sessionId?: string
  name: string
  durationDays: number
  startDate?: string
  endDate?: string
  ticketIds: string[]
  totalFinalStoryPoints: number
  status: SprintStatus
  archived?: boolean
  archivedAt?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export type SprintInput = {
  name: string
  durationDays: number
  startDate?: string
  endDate?: string
}

export type SprintSummaryRecord = Pick<
  Sprint,
  'id' | 'name' | 'durationDays' | 'totalFinalStoryPoints' | 'createdAt' | 'completedAt'
>

export type SprintTicket = Ticket & {
  sprintId?: string
}
