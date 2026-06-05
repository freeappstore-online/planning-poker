import { Badge, Card, EmptyState } from '@freeappstore/sdk/ui'
import type { Sprint } from '../../types/sprint'
import { calculatePointsPerDay, formatMetric } from '../../utils/metrics'

type SprintHistoryProps = {
  onArchive: (sprintId: string, archived: boolean) => Promise<void>
  sprints: Sprint[]
}

export function SprintHistory({ onArchive, sprints }: SprintHistoryProps) {
  return (
    <Card padding="0" style={{ overflow: 'hidden' }}>
      <div className="border-b border-[var(--line)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Sprint history</p>
        <h2 className="mt-1 text-xl font-bold text-[var(--ink)]">Saved summaries</h2>
      </div>
      <div className="p-3">
        {sprints.length === 0 ? (
          <EmptyState message="Completed sprint summaries will appear here." />
        ) : (
          <div className="grid max-h-72 gap-1 overflow-y-auto pr-1">
            {sprints.map((sprint) => (
              <div
                className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 hover:border-[var(--line)] hover:bg-[var(--paper-deep)]"
                key={sprint.id}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-bold text-[var(--ink)]">{sprint.name}</p>
                    {sprint.archived ? <Badge variant="default">Archived</Badge> : null}
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {formatMetric(sprint.totalFinalStoryPoints)} pts -{' '}
                    {formatMetric(calculatePointsPerDay(sprint.totalFinalStoryPoints, sprint.durationDays))} pts/day -{' '}
                    {sprint.durationDays} days
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {sprint.completedAt ? new Date(sprint.completedAt).toLocaleDateString() : 'Saved'}
                  </p>
                </div>
                <button
                  className="shrink-0 rounded-lg border border-[var(--line-strong)] px-3 py-1.5 text-xs font-bold text-[var(--ink)]"
                  onClick={() => void onArchive(sprint.id, !sprint.archived)}
                >
                  {sprint.archived ? 'Unarchive' : 'Archive'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
