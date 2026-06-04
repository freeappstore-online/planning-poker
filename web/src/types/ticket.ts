export type Ticket = {
  id: string
  sessionId?: string
  sprintId?: string
  title: string
  description: string
  finalEstimate?: number
  notes?: string
  activeRoundId?: string
  createdAt: string
  updatedAt: string
}

export type TicketInput = Pick<Ticket, 'title' | 'description'>
