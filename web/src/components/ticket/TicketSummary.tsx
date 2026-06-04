import { useEffect, useState } from 'react'
import { Badge, Card, EmptyState } from '@freeappstore/sdk/ui'
import type { Ticket, TicketInput } from '../../types/ticket'

type TicketSummaryProps = {
  activeSprintName?: string
  isAdmin: boolean
  onManage: () => void
  onNotify?: (message: string, variant: 'success' | 'error') => void
  onUpdate: (ticketId: string, input: TicketInput) => Promise<void>
  ticket: Ticket | null
  ticketCount: number
}

const emptyTicket = { title: '', description: '' }

export function TicketSummary({
  activeSprintName,
  isAdmin,
  onManage,
  onNotify,
  onUpdate,
  ticket,
  ticketCount,
}: TicketSummaryProps) {
  const [draft, setDraft] = useState<TicketInput>(emptyTicket)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setDraft(ticket ? { title: ticket.title, description: ticket.description } : emptyTicket)
    setEditing(false)
    setError('')
  }, [ticket?.id, ticket?.title, ticket?.description])

  async function saveTicket() {
    if (!ticket) return
    if (!draft.title.trim()) {
      setError('Ticket title is required.')
      onNotify?.('Ticket title is required', 'error')
      return
    }

    setError('')
    await onUpdate(ticket.id, { title: draft.title.trim(), description: draft.description.trim() })
    setEditing(false)
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Current ticket</p>
          {editing ? (
            <input
              className="mt-2 w-full rounded-lg border border-[var(--line-strong)] bg-[var(--paper)] px-3 py-2 text-lg font-black text-[var(--ink)]"
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="Ticket title"
              value={draft.title}
            />
          ) : (
            <h2 className="mt-1 break-words text-2xl font-black text-[var(--ink)]">
              {ticket?.title ?? 'No ticket selected'}
            </h2>
          )}
          {activeSprintName ? <p className="mt-1 text-xs font-semibold text-[var(--muted)]">{activeSprintName}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {ticket?.finalEstimate ? <Badge variant="success">{ticket.finalEstimate} pts</Badge> : null}
          <Badge variant="default">{ticketCount} tickets</Badge>
          {isAdmin && ticket ? (
            <button
              className="rounded-lg border border-[var(--line-strong)] px-3 py-2 text-sm font-bold text-[var(--ink)]"
              onClick={() => setEditing((current) => !current)}
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
          ) : null}
          <button
            className="rounded-lg border border-[var(--line-strong)] px-3 py-2 text-sm font-bold text-[var(--ink)]"
            onClick={onManage}
          >
            Tickets
          </button>
        </div>
      </div>

      {ticket ? (
        editing ? (
          <div className="mt-4 grid gap-3">
            <textarea
              className="min-h-28 rounded-lg border border-[var(--line-strong)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)]"
              onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              placeholder="Describe the scope, acceptance criteria, and unknowns."
              value={draft.description}
            />
            {error ? <p className="text-sm text-[var(--error)]">{error}</p> : null}
            <div className="flex flex-wrap gap-2">
              <button className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white" onClick={() => void saveTicket()}>
                Save
              </button>
              <button
                className="rounded-lg border border-[var(--line-strong)] px-4 py-2 text-sm font-bold text-[var(--ink)]"
                onClick={() => {
                  setDraft({ title: ticket.title, description: ticket.description })
                  setEditing(false)
                  setError('')
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--muted)]">{ticket.description}</p>
        )
      ) : (
        <div className="mt-4">
          <EmptyState message="Create or select a ticket from the ticket manager." />
        </div>
      )}
    </Card>
  )
}
