import { Card, EmptyState, ListRow } from '@freeappstore/sdk/ui'
import type { Sprint } from '../../types/sprint'
import { calculatePointsPerDay, formatMetric } from '../../utils/metrics'

type SprintHistoryProps = {
  sprints: Sprint[]
}

export function SprintHistory({ sprints }: SprintHistoryProps) {
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
              <ListRow
                key={sprint.id}
                title={sprint.name}
                subtitle={`${formatMetric(sprint.totalFinalStoryPoints)} pts · ${formatMetric(
                  calculatePointsPerDay(sprint.totalFinalStoryPoints, sprint.durationDays),
                )} pts/day · ${sprint.durationDays} days`}
                trailing={
                  <span className="text-xs font-semibold text-[var(--muted)]">
                    {sprint.completedAt ? new Date(sprint.completedAt).toLocaleDateString() : 'Saved'}
                  </span>
                }
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
