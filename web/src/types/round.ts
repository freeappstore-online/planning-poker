export type EstimationRound = {
  id: string
  sessionId?: string
  sprintId?: string
  ticketId: string
  roundNumber: number
  revealed: boolean
  createdAt: string
  revealedAt?: string
}
