import { useState } from 'react'
import { Badge, Card, ConfirmDialog, EmptyState } from '@freeappstore/sdk/ui'
import type { Ticket, TicketInput } from '../../types/ticket'

type TicketPanelProps = {
  activeTicket: Ticket | null
  activeSprintName?: string
  isAdmin: boolean
  onNotify?: (message: string, variant: 'success' | 'error') => void
  onCreate: (input: TicketInput) => Promise<void>
  onDelete: (ticketId: string) => Promise<void>
  onSelect: (ticketId: string) => Promise<void>
  tickets: Ticket[]
}

const emptyTicket = { title: '', description: '' }

export function TicketPanel({
  activeTicket,
  activeSprintName,
  isAdmin,
  onNotify,
  onCreate,
  onDelete,
  onSelect,
  tickets,
}: TicketPanelProps) {
  const [draft, setDraft] = useState<TicketInput>(emptyTicket)
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Ticket | null>(null)
  const [error, setError] = useState('')

  async function saveTicket() {
    if (!draft.title.trim()) {
      setError('Ticket title is required.')
      onNotify?.('Ticket title is required', 'error')
      return
    }

    setError('')
    await onCreate({ title: draft.title.trim(), description: draft.description.trim() })
    setDraft(emptyTicket)
    setCreating(false)
  }

  return (
    <Card padding="0" style={{ overflow: 'hidden' }}>
      <div className="border-b border-[var(--line)] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Ticket</p>
            <h2 className="mt-1 text-xl font-bold text-[var(--ink)]">{activeTicket?.title ?? 'No active ticket'}</h2>
            {activeSprintName ? <p className="mt-1 text-xs font-semibold text-[var(--muted)]">{activeSprintName}</p> : null}
          </div>
          {activeTicket?.finalEstimate ? <Badge variant="success">{activeTicket.finalEstimate} pts</Badge> : null}
        </div>
        {activeTicket ? (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--muted)]">{activeTicket.description}</p>
        ) : (
          <EmptyState title="Ready for a ticket" message="An admin can create the first estimation item." />
        )}
      </div>

      {isAdmin ? (
        <div className="grid gap-3 p-5">
          {creating ? (
            <>
              <label className="text-sm font-semibold text-[var(--ink)]" htmlFor="ticket-title">
                Create ticket
              </label>
              <input
                id="ticket-title"
                className="rounded-lg border border-[var(--line-strong)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)]"
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                placeholder="Ticket title"
                value={draft.title}
              />
              <textarea
                className="min-h-24 rounded-lg border border-[var(--line-strong)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)]"
                onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                placeholder="Describe the scope, acceptance criteria, and unknowns."
                value={draft.description}
              />
              {error ? <p className="text-sm text-[var(--error)]">{error}</p> : null}
              <div className="flex flex-wrap gap-2">
                <button className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white" onClick={saveTicket}>
                  Create and select
                </button>
                <button
                  className="rounded-lg border border-[var(--line-strong)] px-4 py-2 text-sm font-bold text-[var(--ink)]"
                  onClick={() => {
                    setDraft(emptyTicket)
                    setCreating(false)
                    setError('')
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <button
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white"
              onClick={() => setCreating(true)}
            >
              Create ticket
            </button>
          )}
        </div>
      ) : null}

      <div className="border-t border-[var(--line)] p-3">
        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Sprint tickets</p>
        {tickets.length === 0 ? (
          <EmptyState message="No tickets have been created yet." />
        ) : (
          <div className="grid max-h-80 gap-1 overflow-y-auto pr-1">
            {tickets.map((ticket) => (
              <div
                className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-left hover:border-[var(--line)] hover:bg-[var(--paper-deep)]"
                key={ticket.id}
                onClick={isAdmin ? () => void onSelect(ticket.id) : undefined}
                role={isAdmin ? 'button' : undefined}
                tabIndex={isAdmin ? 0 : undefined}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-bold text-[var(--ink)]">{ticket.title}</p>
                    {ticket.id === activeTicket?.id ? <Badge variant="accent">Active</Badge> : null}
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {ticket.finalEstimate ? `Final estimate: ${ticket.finalEstimate}` : 'Unestimated'}
                  </p>
                </div>
                {isAdmin ? (
                  <button
                    className="shrink-0 rounded-lg border border-[var(--line-strong)] px-3 py-1.5 text-xs font-bold text-[var(--error)]"
                    onClick={(event) => {
                      event.stopPropagation()
                      setDeleteTarget(ticket)
                    }}
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        confirmLabel="Delete ticket"
        message="This removes the ticket from the active list. Existing round and vote records remain in collections."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) void onDelete(deleteTarget.id)
          setDeleteTarget(null)
        }}
        open={Boolean(deleteTarget)}
        title="Delete ticket?"
        variant="danger"
      />
    </Card>
  )
}
