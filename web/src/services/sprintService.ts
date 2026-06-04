import type { FreeAppStore } from '@freeappstore/sdk'
import type { Sprint, SprintInput } from '../types/sprint'
import type { Ticket } from '../types/ticket'
import { calculateSprintTotal } from '../utils/metrics'

type SprintCollection = ReturnType<FreeAppStore['collections']['collection']>

function now() {
  return new Date().toISOString()
}

function trimOptional(value?: string) {
  const trimmed = value?.trim()
  return trimmed || undefined
}

export function createSprintService(collection: SprintCollection) {
  return {
    async list() {
      const result = await collection.query<Sprint>({ limit: 100, orderBy: 'updatedAt', order: 'desc' })
      return result.documents
    },

    async create(input: SprintInput, userId?: string, sessionId?: string) {
      const timestamp = now()
      const sprint = await collection.create({
        userId,
        sessionId,
        name: input.name.trim(),
        durationDays: input.durationDays,
        startDate: trimOptional(input.startDate),
        endDate: trimOptional(input.endDate),
        ticketIds: [],
        totalFinalStoryPoints: 0,
        status: 'active',
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      return sprint as Sprint
    },

    async updateTicketSummary(sprint: Sprint, tickets: Ticket[]) {
      const timestamp = now()
      const sprintTickets = tickets.filter((ticket) => ticket.sprintId === sprint.id)
      return collection.update<Sprint>(sprint.id, {
        ticketIds: sprintTickets.map((ticket) => ticket.id),
        totalFinalStoryPoints: calculateSprintTotal(sprintTickets),
        updatedAt: timestamp,
      })
    },

    async complete(sprint: Sprint, tickets: Ticket[]) {
      const timestamp = now()
      const sprintTickets = tickets.filter((ticket) => ticket.sprintId === sprint.id)
      return collection.update<Sprint>(sprint.id, {
        ticketIds: sprintTickets.map((ticket) => ticket.id),
        totalFinalStoryPoints: calculateSprintTotal(sprintTickets),
        status: 'completed',
        completedAt: timestamp,
        updatedAt: timestamp,
      })
    },
  }
}
