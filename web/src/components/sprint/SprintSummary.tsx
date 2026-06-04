import { Badge, Card, EmptyState } from '@freeappstore/sdk/ui'
import type { Sprint } from '../../types/sprint'
import { formatMetric } from '../../utils/metrics'

type SprintSummaryProps = {
  averageVelocity: number
  pointsPerDay: number
  sprint: Sprint | null
  totalStoryPoints: number
}

export function SprintSummary({ averageVelocity, pointsPerDay, sprint, totalStoryPoints }: SprintSummaryProps) {
  if (!sprint) {
    return (
      <Card>
        <EmptyState title="No sprint selected" message="Create or select a sprint to group estimation results." />
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Current sprint</p>
          <h2 className="mt-1 text-xl font-bold text-[var(--ink)]">{sprint.name}</h2>
        </div>
        <Badge variant={sprint.status === 'completed' ? 'success' : 'accent'}>{sprint.status}</Badge>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Duration" value={`${sprint.durationDays} days`} />
        <Metric label="Total points" value={formatMetric(totalStoryPoints)} />
        <Metric label="Points/day" value={formatMetric(pointsPerDay)} />
        <Metric label="Avg velocity" value={averageVelocity ? formatMetric(averageVelocity) : 'N/A'} />
      </div>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--paper)] p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-2xl font-black text-[var(--ink)]">{value}</p>
    </div>
  )
}
