import type { Sprint } from '../types/sprint'
import type { Ticket } from '../types/ticket'

export function calculateSprintTotal(tickets: Pick<Ticket, 'finalEstimate'>[]) {
  return tickets.reduce((total, ticket) => total + (ticket.finalEstimate ?? 0), 0)
}

export function calculatePointsPerDay(totalPoints: number, durationDays: number) {
  if (durationDays <= 0) return 0
  return totalPoints / durationDays
}

export function calculateAverageVelocity(sprints: Pick<Sprint, 'totalFinalStoryPoints'>[]) {
  if (sprints.length === 0) return 0
  return sprints.reduce((total, sprint) => total + sprint.totalFinalStoryPoints, 0) / sprints.length
}

export function formatMetric(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}
