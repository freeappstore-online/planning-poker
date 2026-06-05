import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FreeAppStore, User } from '@freeappstore/sdk'
import { createSprintService } from '../services/sprintService'
import type { FinalEstimate } from '../types/finalEstimate'
import type { EstimationRound } from '../types/round'
import type { PlanningPokerSession } from '../types/session'
import type { Sprint, SprintInput } from '../types/sprint'
import type { Ticket, TicketInput } from '../types/ticket'
import type { Vote, VoteInput } from '../types/vote'
import { calculateAverageVelocity, calculatePointsPerDay, calculateSprintTotal } from '../utils/metrics'
import { usePlanningPokerRoom } from './usePlanningPokerRoom'

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

const SESSION_NAME = 'Planning Poker Session'

function withoutId<T extends { id: string }>(document: T) {
  const { id: _id, ...payload } = document
  void _id
  return payload
}

function now() {
  return new Date().toISOString()
}

export function usePlanningPoker(
  app: FreeAppStore,
  user: User | null,
  participantName: string,
  sessionId: string | null,
  hasOwnerToken: boolean,
) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [rounds, setRounds] = useState<EstimationRound[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [finalEstimates, setFinalEstimates] = useState<FinalEstimate[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [session, setSession] = useState<PlanningPokerSession | null>(null)
  const [status, setStatus] = useState<LoadState>('idle')
  const [error, setError] = useState<string | null>(null)

  const collections = useMemo(
    () => ({
      tickets: app.collections.collection('tickets'),
      sessions: app.collections.collection('sessions'),
      sprints: app.collections.collection('sprints'),
      rounds: app.collections.collection('rounds'),
      votes: app.collections.collection('votes'),
      finalEstimates: app.collections.collection('final-estimates'),
    }),
    [app],
  )

  const sprintService = useMemo(() => createSprintService(collections.sprints), [collections.sprints])

  const refresh = useCallback(async () => {
    if (!sessionId || !user) {
      setStatus('idle')
      return
    }

    setStatus((current) => (current === 'ready' ? current : 'loading'))
    setError(null)

    try {
      const [sessionResult, sprintResult, ticketResult, roundResult, voteResult, estimateResult] = await Promise.all([
        collections.sessions.query<PlanningPokerSession>({ limit: 100, orderBy: 'createdAt', order: 'asc' }),
        collections.sprints.query<Sprint>({ limit: 100, orderBy: 'updatedAt', order: 'desc' }),
        collections.tickets.query<Ticket>({ limit: 100, orderBy: 'updatedAt', order: 'desc' }),
        collections.rounds.query<EstimationRound>({ limit: 500, orderBy: 'createdAt', order: 'asc' }),
        collections.votes.query<Vote>({ limit: 1000, orderBy: 'createdAt', order: 'asc' }),
        collections.finalEstimates.query<FinalEstimate>({ limit: 500, orderBy: 'createdAt', order: 'desc' }),
      ])

      let activeSession = sessionResult.documents.find((document) => document.sessionId === sessionId) ?? null
      if (!activeSession && hasOwnerToken) {
        activeSession = await collections.sessions.create({
          sessionId,
          name: SESSION_NAME,
          adminUserId: user.id,
          ownerTokenCreatedAt: now(),
          status: 'active' as const,
          createdAt: now(),
          updatedAt: now(),
        })
      }

      const activeSessionSprintId = activeSession?.activeSprintId
      const visibleSprints = sprintResult.documents.filter((document) => {
        if (hasOwnerToken) {
          return document.userId === user.id || document.sessionId === sessionId || (!document.userId && !document.sessionId)
        }

        return document.id === activeSessionSprintId
      })
      const visibleSprintIds = new Set(visibleSprints.map((sprint) => sprint.id))
      const visibleTickets = ticketResult.documents.filter((document) => {
        if (hasOwnerToken) {
          return document.sessionId === sessionId || (document.sprintId ? visibleSprintIds.has(document.sprintId) : false)
        }

        return (
          document.id === activeSession?.activeTicketId ||
          (document.sprintId ? visibleSprintIds.has(document.sprintId) : false) ||
          (!document.sprintId && document.sessionId === sessionId)
        )
      })
      const visibleTicketIds = new Set(visibleTickets.map((ticket) => ticket.id))
      const visibleRounds = roundResult.documents.filter(
        (document) =>
          document.sessionId === sessionId ||
          visibleTicketIds.has(document.ticketId) ||
          (document.sprintId ? visibleSprintIds.has(document.sprintId) : false),
      )
      const visibleRoundIds = new Set(visibleRounds.map((round) => round.id))

      setSession(activeSession)
      setSprints(visibleSprints)
      setTickets(visibleTickets)
      setRounds(visibleRounds)
      setVotes(
        voteResult.documents.filter(
          (document) =>
            document.sessionId === sessionId ||
            visibleTicketIds.has(document.ticketId) ||
            visibleRoundIds.has(document.roundId) ||
            (document.sprintId ? visibleSprintIds.has(document.sprintId) : false),
        ),
      )
      setFinalEstimates(
        estimateResult.documents.filter(
          (document) =>
            document.sessionId === sessionId ||
            visibleTicketIds.has(document.ticketId) ||
            (document.sprintId ? visibleSprintIds.has(document.sprintId) : false),
        ),
      )
      setStatus('ready')
    } catch (caught) {
      setStatus('error')
      setError(caught instanceof Error ? caught.message : 'Unable to load planning poker data.')
    }
  }, [collections, hasOwnerToken, sessionId, user])

  const isAdmin = Boolean(sessionId && hasOwnerToken)
  const sessionEnded = session?.status === 'ended'
  const activeSprint =
    sprints.find((sprint) => sprint.id === session?.activeSprintId) ??
    sprints.find((sprint) => sprint.status !== 'completed') ??
    null
  const sprintTickets = activeSprint ? tickets.filter((ticket) => ticket.sprintId === activeSprint.id) : tickets
  const historicalSprints = isAdmin
    ? sprints
        .filter((sprint) => sprint.status === 'completed')
        .sort((first, second) => (second.completedAt ?? second.updatedAt).localeCompare(first.completedAt ?? first.updatedAt))
    : []
  const activeSprintTotal = calculateSprintTotal(sprintTickets)
  const activeSprintPointsPerDay = activeSprint
    ? calculatePointsPerDay(activeSprintTotal, activeSprint.durationDays)
    : 0
  const averageVelocity = calculateAverageVelocity(historicalSprints)
  const activeSprintLocked = activeSprint?.status === 'completed'
  const activeTicket = sprintTickets.find((ticket) => ticket.id === session?.activeTicketId) ?? sprintTickets[0] ?? null
  const activeRound = activeTicket
    ? rounds.find((round) => round.id === activeTicket.activeRoundId) ??
      rounds.filter((round) => round.ticketId === activeTicket.id).at(-1) ??
      null
    : null

  const activeVotes = activeRound ? votes.filter((vote) => vote.roundId === activeRound.id) : []
  const previousRounds = activeTicket
    ? rounds.filter((round) => round.ticketId === activeTicket.id && round.id !== activeRound?.id)
    : []
  const currentUserVote = activeVotes.find((vote) => vote.participantName === participantName) ?? null

  const handleRoomEvent = useCallback(() => {
    void refresh()
  }, [refresh])

  const room = usePlanningPokerRoom(app, sessionId, handleRoomEvent)

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!sessionId || !user || room.connectionState === 'open') return

    const refreshTimer = window.setInterval(() => {
      void refresh()
    }, 5000)

    return () => window.clearInterval(refreshTimer)
  }, [refresh, room.connectionState, sessionId, user])

  const createTicket = useCallback(
    async (input: TicketInput) => {
      if (!sessionId || sessionEnded) return
      if (!activeSprint) throw new Error('Create or select a sprint before adding tickets.')
      if (activeSprintLocked) throw new Error('Select an active sprint before adding tickets.')

      const timestamp = now()
      const ticket = await collections.tickets.create({
        ...input,
        sessionId,
        sprintId: activeSprint.id,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      const round = await collections.rounds.create({
        sessionId,
        sprintId: activeSprint.id,
        ticketId: ticket.id,
        roundNumber: 1,
        revealed: false,
        createdAt: timestamp,
      })
      await collections.tickets.update<Ticket>(ticket.id, { activeRoundId: round.id, updatedAt: now() })
      if (session) {
        await collections.sessions.update<PlanningPokerSession>(session.id, {
          activeTicketId: ticket.id,
          updatedAt: now(),
        })
      }
      await sprintService.updateTicketSummary(activeSprint, [...tickets, { ...ticket, activeRoundId: round.id }])
      room.publish({ type: 'ticket:changed' })
      await refresh()
    },
    [activeSprint, activeSprintLocked, collections, refresh, room, session, sessionEnded, sessionId, sprintService, tickets],
  )

  const updateTicket = useCallback(
    async (ticketId: string, input: TicketInput) => {
      if (sessionEnded) return
      if (activeSprintLocked) return
      await collections.tickets.update<Ticket>(ticketId, { ...input, updatedAt: now() })
      if (activeSprint) {
        await sprintService.updateTicketSummary(activeSprint, tickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, ...input } : ticket)))
      }
      room.publish({ type: 'ticket:changed' })
      await refresh()
    },
    [activeSprint, activeSprintLocked, collections, refresh, room, sessionEnded, sprintService, tickets],
  )

  const deleteTicket = useCallback(
    async (ticketId: string) => {
      if (!session) return
      if (sessionEnded) return
      if (activeSprintLocked) return
      await collections.tickets.delete(ticketId)
      const nextTicket = sprintTickets.find((ticket) => ticket.id !== ticketId)
      await collections.sessions.update<PlanningPokerSession>(session.id, {
        activeTicketId: nextTicket?.id,
        updatedAt: now(),
      })
      if (activeSprint) {
        await sprintService.updateTicketSummary(activeSprint, tickets.filter((ticket) => ticket.id !== ticketId))
      }
      room.publish({ type: 'ticket:changed' })
      await refresh()
    },
    [activeSprint, activeSprintLocked, collections, refresh, room, session, sessionEnded, sprintService, sprintTickets, tickets],
  )

  const selectTicket = useCallback(
    async (ticketId: string) => {
      if (!session) return
      if (sessionEnded) return
      if (activeSprintLocked) return
      await collections.sessions.update<PlanningPokerSession>(session.id, {
        activeTicketId: ticketId,
        updatedAt: now(),
      })
      room.publish({ type: 'ticket:changed' })
      await refresh()
    },
    [activeSprintLocked, collections, refresh, room, session, sessionEnded],
  )

  const submitVote = useCallback(
    async (input: VoteInput) => {
      if (!activeRound || !activeTicket || !sessionId || !participantName.trim() || sessionEnded) return
      if (activeSprintLocked) return

      const existingVote = activeVotes.find((vote) => vote.participantName === participantName)
      const payload = {
        sessionId,
        sprintId: activeSprint?.id,
        ticketId: activeTicket.id,
        roundId: activeRound.id,
        participantName,
        storyPoint: input.storyPoint,
        comment: input.comment?.trim() || undefined,
        createdAt: existingVote?.createdAt ?? now(),
      }

      if (existingVote) {
        await collections.votes.update<Vote>(existingVote.id, payload)
      } else {
        await collections.votes.create(payload)
      }

      room.publish({ type: 'vote:submitted' })
      await refresh()
    },
    [activeRound, activeSprintLocked, activeTicket, activeVotes, collections, participantName, refresh, room, sessionEnded, sessionId],
  )

  const revealRound = useCallback(async () => {
    if (!activeRound) return
    if (sessionEnded) return
    if (activeSprintLocked) return
    await collections.rounds.update<EstimationRound>(activeRound.id, { revealed: true, revealedAt: now() })
    room.publish({ type: 'round:revealed' })
    await refresh()
  }, [activeRound, activeSprintLocked, collections, refresh, room, sessionEnded])

  const startNewRound = useCallback(async () => {
    if (!activeTicket || !sessionId || sessionEnded) return
    if (activeSprintLocked) return
    const ticketRounds = rounds.filter((round) => round.ticketId === activeTicket.id)
    const round = await collections.rounds.create({
      sessionId,
      sprintId: activeSprint?.id,
      ticketId: activeTicket.id,
      roundNumber: ticketRounds.length + 1,
      revealed: false,
      createdAt: now(),
    })
    await collections.tickets.update<Ticket>(activeTicket.id, { activeRoundId: round.id, updatedAt: now() })
    room.publish({ type: 'round:started' })
    await refresh()
  }, [activeSprintLocked, activeTicket, collections, refresh, room, rounds, sessionEnded, sessionId])

  const confirmFinalEstimate = useCallback(
    async (estimate: number) => {
      if (!activeTicket || !sessionId || !user || sessionEnded) return
      if (activeSprintLocked) return
      const timestamp = now()
      await collections.finalEstimates.create({
        sessionId,
        sprintId: activeSprint?.id,
        ticketId: activeTicket.id,
        estimate,
        recordedBy: user.login,
        createdAt: timestamp,
      })
      await collections.tickets.update<Ticket>(activeTicket.id, { finalEstimate: estimate, updatedAt: timestamp })
      if (activeSprint) {
        await sprintService.updateTicketSummary(
          activeSprint,
          tickets.map((ticket) => (ticket.id === activeTicket.id ? { ...ticket, finalEstimate: estimate } : ticket)),
        )
      }
      room.publish({ type: 'estimate:confirmed' })
      await refresh()
    },
    [activeSprint, activeSprintLocked, activeTicket, collections, refresh, room, sessionEnded, sessionId, sprintService, tickets, user],
  )

  const createSprint = useCallback(
    async (input: SprintInput) => {
      if (!session || !sessionId || !user || sessionEnded) return
      const sprint = await sprintService.create(input, user.id, sessionId)
      await collections.sessions.update<PlanningPokerSession>(session.id, {
        activeSprintId: sprint.id,
        activeTicketId: undefined,
        updatedAt: now(),
      })
      room.publish({ type: 'sprint:changed' })
      await refresh()
    },
    [collections.sessions, refresh, room, session, sessionEnded, sessionId, sprintService, user],
  )

  const selectSprint = useCallback(
    async (sprintId: string) => {
      if (!session || sessionEnded) return
      const nextTicket = tickets.find((ticket) => ticket.sprintId === sprintId)
      await collections.sessions.update<PlanningPokerSession>(session.id, {
        activeSprintId: sprintId,
        activeTicketId: nextTicket?.id,
        updatedAt: now(),
      })
      room.publish({ type: 'sprint:changed' })
      await refresh()
    },
    [collections.sessions, refresh, room, session, sessionEnded, tickets],
  )

  const completeSprint = useCallback(async () => {
    if (!activeSprint || sessionEnded) return
    await sprintService.complete(activeSprint, tickets)
    room.publish({ type: 'sprint:changed' })
    await refresh()
  }, [activeSprint, refresh, room, sessionEnded, sprintService, tickets])

  const endSession = useCallback(async () => {
    if (!session || !user || !isAdmin) return
    await collections.sessions.update<PlanningPokerSession>(session.id, {
      status: 'ended',
      endedAt: now(),
      endedBy: user.login,
      updatedAt: now(),
    })
    room.publish({ type: 'session:ended' })
    await refresh()
  }, [collections, isAdmin, refresh, room, session, user])

  const canInteract = !sessionEnded && !activeSprintLocked

  return {
    activeRound,
    activeSprint,
    activeSprintPointsPerDay,
    activeSprintTotal,
    activeTicket,
    activeVotes,
    averageVelocity,
    canInteract,
    completeSprint,
    connectionState: room.connectionState,
    createSprint,
    createTicket,
    currentUserVote,
    deleteTicket,
    endSession,
    error,
    finalEstimates,
    isAdmin,
    peers: room.peers,
    previousRounds,
    refresh,
    revealRound,
    rounds,
    selectTicket,
    session,
    sessionEnded,
    selectSprint,
    startNewRound,
    status,
    submitVote,
    sprints,
    sprintTickets: sprintTickets.map((ticket) => ({ ...withoutId(ticket), id: ticket.id })),
    historicalSprints,
    tickets: sprintTickets.map((ticket) => ({ ...withoutId(ticket), id: ticket.id })),
    updateTicket,
    votes,
    confirmFinalEstimate,
  }
}
