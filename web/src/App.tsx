import { useCallback, useState } from 'react'
import { initApp } from '@freeappstore/sdk'
import { useAuth } from '@freeappstore/sdk/hooks'
import { Badge, BuildInfo, ConfirmDialog, ErrorBoundary, FasShell, Modal, Spinner } from '@freeappstore/sdk/ui'
import { AdminControls } from './components/admin/AdminControls'
import { EntryScreen } from './components/common/EntryScreen'
import { ToastStack, type ToastMessage } from './components/common/ToastStack'
import { RoundHistory } from './components/rounds/RoundHistory'
import { SprintHistory } from './components/sprint/SprintHistory'
import { SprintPanel } from './components/sprint/SprintPanel'
import { SprintSummary } from './components/sprint/SprintSummary'
import { TicketPanel } from './components/ticket/TicketPanel'
import { TicketSummary } from './components/ticket/TicketSummary'
import { VoteBoard } from './components/voting/VoteBoard'
import { VotingPanel } from './components/voting/VotingPanel'
import { usePlanningPoker } from './hooks/usePlanningPoker'
import { useSessionAccess } from './hooks/useSessionAccess'

const fas = initApp({ appId: 'planning-poker' })

export default function App() {
  const [endDialogOpen, setEndDialogOpen] = useState(false)
  const [roundsDialogOpen, setRoundsDialogOpen] = useState(false)
  const [sprintDialogOpen, setSprintDialogOpen] = useState(false)
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const { signIn, user } = useAuth(fas)
  const sessionAccess = useSessionAccess()
  const participantName = user?.login ?? ''
  const poker = usePlanningPoker(fas, user, participantName, sessionAccess.sessionId, sessionAccess.isOwner)
  const hasSessionIdentity = Boolean(sessionAccess.sessionId && user)
  const participantNames = Array.from(
    new Set([
      participantName,
      ...poker.peers.map((peer) => peer.login),
      ...poker.activeVotes.map((vote) => vote.participantName),
    ].filter(Boolean)),
  )
  const notify = useCallback((message: string, variant: ToastMessage['variant'] = 'success') => {
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { id, message, variant }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 2800)
  }, [])

  const runWithToast = useCallback(
    async (action: () => Promise<void>, successMessage: string) => {
      try {
        await action()
        notify(successMessage, 'success')
        return true
      } catch (caught) {
        notify(caught instanceof Error ? caught.message : 'Something went wrong', 'error')
        return false
      }
    },
    [notify],
  )

  return (
    <FasShell app={fas} appName="Planning Poker" showThemeToggle>
      <ErrorBoundary>
        <ToastStack toasts={toasts} />
        {!hasSessionIdentity ? (
          <EntryScreen
            initialSessionId={sessionAccess.sessionId}
            onCreateSession={sessionAccess.createSession}
            onJoinSession={sessionAccess.joinSession}
            onSignIn={signIn}
            signedIn={Boolean(user)}
          />
        ) : (
          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Scrum estimation</p>
              <h1 className="display-font mt-1 text-4xl font-black text-[var(--ink)]">Planning Poker</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={poker.connectionState === 'open' ? 'success' : 'warning'}>
                {poker.connectionState === 'open' ? 'Realtime' : 'Connecting'}
              </Badge>
              <Badge variant={poker.isAdmin ? 'accent' : 'default'}>{poker.isAdmin ? 'Admin' : 'Player'}</Badge>
              <Badge variant="default">{participantName}</Badge>
              <Badge variant="default">{poker.peers.length} online</Badge>
              <button
                className="rounded-lg border border-[var(--line-strong)] px-3 py-1.5 text-xs font-bold text-[var(--ink)]"
                onClick={sessionAccess.leaveSession}
              >
                Leave
              </button>
            </div>
          </header>

          {poker.isAdmin ? (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--paper)] p-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Player room link</p>
                <p className="mt-1 truncate text-sm text-[var(--ink)]">{sessionAccess.joinLink}</p>
              </div>
              <button
                className="rounded-lg bg-[var(--sky)] px-4 py-2 text-sm font-black text-white"
                onClick={() => void navigator.clipboard.writeText(sessionAccess.joinLink)}
              >
                Copy link
              </button>
              <button
                className="rounded-lg border border-[var(--line-strong)] px-4 py-2 text-sm font-black text-[var(--error)] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={poker.sessionEnded}
                onClick={() => setEndDialogOpen(true)}
              >
                End session
              </button>
            </div>
          ) : null}

          {poker.sessionEnded ? (
            <div className="rounded-xl border border-[var(--line-strong)] bg-[var(--paper)] p-5">
              <p className="text-sm font-black text-[var(--ink)]">This session has ended.</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Votes and estimates remain visible for reference, but new changes are disabled.
              </p>
            </div>
          ) : null}

          {poker.status === 'loading' || poker.status === 'idle' ? (
            <div className="grid min-h-80 place-items-center">
              <Spinner size={32} />
            </div>
          ) : null}

          {poker.status === 'error' ? (
            <div className="rounded-xl border border-[var(--line-strong)] bg-[var(--paper)] p-6 text-[var(--error)]">
              {poker.error}
            </div>
          ) : null}

          {poker.status === 'ready' ? (
            <>
              <section className="mx-auto grid w-full max-w-5xl content-start gap-6">
                <SprintSummary
                  averageVelocity={poker.averageVelocity}
                  pointsPerDay={poker.activeSprintPointsPerDay}
                  sprint={poker.activeSprint}
                  totalStoryPoints={poker.activeSprintTotal}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded-lg border border-[var(--line-strong)] px-4 py-2 text-sm font-bold text-[var(--ink)]"
                    onClick={() => setSprintDialogOpen(true)}
                  >
                    Sprints
                  </button>
                  <button
                    className="rounded-lg border border-[var(--line-strong)] px-4 py-2 text-sm font-bold text-[var(--ink)]"
                    onClick={() => setRoundsDialogOpen(true)}
                  >
                    Rounds
                  </button>
                </div>
                <TicketSummary
                  activeSprintName={poker.activeSprint?.name}
                  isAdmin={poker.isAdmin && poker.canInteract}
                  onManage={() => setTicketDialogOpen(true)}
                  onNotify={notify}
                  onUpdate={async (ticketId, input) => {
                    await runWithToast(() => poker.updateTicket(ticketId, input), 'Ticket updated successfully')
                  }}
                  ticket={poker.activeTicket}
                  ticketCount={poker.tickets.length}
                />
                <VoteBoard
                  isAdmin={poker.isAdmin && poker.canInteract}
                  onReveal={async () => {
                    await runWithToast(poker.revealRound, 'Votes revealed')
                  }}
                  participantNames={participantNames}
                  round={poker.activeRound}
                  votes={poker.activeVotes}
                />
                <VotingPanel
                  currentUserVote={poker.currentUserVote}
                  onSubmit={async (input) => {
                    await runWithToast(() => poker.submitVote(input), 'Vote submitted')
                  }}
                  participantName={participantName}
                  round={poker.activeRound}
                  ticket={poker.canInteract ? poker.activeTicket : null}
                />
                <AdminControls
                  activeRound={poker.activeRound}
                  activeTicket={poker.activeTicket}
                  isAdmin={poker.isAdmin && poker.canInteract}
                  onConfirmEstimate={async (estimate) => {
                    await runWithToast(() => poker.confirmFinalEstimate(estimate), 'Consensus estimate recorded')
                  }}
                  onStartRound={async () => {
                    await runWithToast(poker.startNewRound, 'New round started')
                  }}
                />
              </section>
            </>
          ) : null}
          <footer className="py-4 text-center text-sm text-[var(--muted)]">
            Part of{' '}
            <a className="font-bold text-[var(--accent)]" href="https://freeappstore.online" rel="noreferrer" target="_blank">
              FreeAppStore
            </a>
          </footer>
        </main>
        )}
        <Modal open={Boolean(hasSessionIdentity && sprintDialogOpen)} onClose={() => setSprintDialogOpen(false)} title="Sprints">
          <div className="grid max-h-[75dvh] gap-4 overflow-y-auto pr-1">
            <SprintPanel
              activeSprint={poker.activeSprint}
              isAdmin={poker.isAdmin && !poker.sessionEnded}
              onComplete={async () => {
                const completed = await runWithToast(poker.completeSprint, 'Sprint summary saved')
                if (completed) setSprintDialogOpen(false)
              }}
              onCreate={async (input) => {
                const completed = await runWithToast(() => poker.createSprint(input), 'Sprint created successfully')
                if (completed) setSprintDialogOpen(false)
              }}
              onSelect={async (sprintId) => {
                const completed = await runWithToast(() => poker.selectSprint(sprintId), 'Sprint selected')
                if (completed) setSprintDialogOpen(false)
              }}
              sprints={poker.sprints}
            />
            <SprintHistory sprints={poker.historicalSprints} />
          </div>
        </Modal>
        <Modal open={Boolean(hasSessionIdentity && ticketDialogOpen)} onClose={() => setTicketDialogOpen(false)} title="Tickets">
          <div className="max-h-[75dvh] overflow-y-auto pr-1">
            <TicketPanel
              activeTicket={poker.activeTicket}
              activeSprintName={poker.activeSprint?.name}
              isAdmin={poker.isAdmin && poker.canInteract}
              onCreate={async (input) => {
                const completed = await runWithToast(() => poker.createTicket(input), 'Ticket created successfully')
                if (completed) setTicketDialogOpen(false)
              }}
              onDelete={async (ticketId) => {
                await runWithToast(() => poker.deleteTicket(ticketId), 'Ticket deleted')
              }}
              onNotify={notify}
              onSelect={async (ticketId) => {
                const completed = await runWithToast(() => poker.selectTicket(ticketId), 'Ticket selected')
                if (completed) setTicketDialogOpen(false)
              }}
              tickets={poker.tickets}
            />
          </div>
        </Modal>
        <Modal open={Boolean(hasSessionIdentity && roundsDialogOpen)} onClose={() => setRoundsDialogOpen(false)} title="Rounds">
          <div className="max-h-[75dvh] overflow-y-auto pr-1">
            <RoundHistory rounds={poker.previousRounds} votes={poker.votes} />
          </div>
        </Modal>
        <ConfirmDialog
          confirmLabel="End session"
          message="This will end the session for everyone. Existing tickets, rounds, votes, and final estimates remain visible, but new changes will be disabled."
          onCancel={() => setEndDialogOpen(false)}
          onConfirm={() => {
            setEndDialogOpen(false)
            if (poker.isAdmin) void runWithToast(poker.endSession, 'Session ended')
          }}
          open={endDialogOpen && poker.isAdmin}
          title="End this session?"
          variant="danger"
        />
        <Modal open={Boolean(hasSessionIdentity && poker.sessionEnded && !poker.isAdmin)} onClose={sessionAccess.leaveSession} title="Session ended">
          <div className="grid gap-4">
            <p className="text-sm leading-6 text-[var(--muted)]">
              The facilitator ended this session. Existing results are no longer editable.
            </p>
            <button
              className="rounded-lg bg-[var(--accent)] px-4 py-3 text-sm font-black text-white"
              onClick={sessionAccess.leaveSession}
            >
              Leave session
            </button>
          </div>
        </Modal>
      </ErrorBoundary>
      <BuildInfo />
    </FasShell>
  )
}
