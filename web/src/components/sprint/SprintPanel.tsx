import { useMemo, useState } from 'react'
import { Badge, Card, EmptyState, ListRow } from '@freeappstore/sdk/ui'
import type { Sprint, SprintDurationOption, SprintInput } from '../../types/sprint'

type SprintPanelProps = {
  activeSprint: Sprint | null
  isAdmin: boolean
  onComplete: () => Promise<void>
  onCreate: (input: SprintInput) => Promise<void>
  onSelect: (sprintId: string) => Promise<void>
  sprints: Sprint[]
}

const durationOptions: { label: string; value: SprintDurationOption }[] = [
  { label: '5 working days', value: 5 },
  { label: '10 working days', value: 10 },
  { label: 'Custom', value: 'custom' },
]

export function SprintPanel({ activeSprint, isAdmin, onComplete, onCreate, onSelect, sprints }: SprintPanelProps) {
  const [name, setName] = useState('')
  const [durationOption, setDurationOption] = useState<SprintDurationOption>(10)
  const [customDuration, setCustomDuration] = useState(10)
  const [error, setError] = useState('')

  const durationDays = useMemo(
    () => (durationOption === 'custom' ? customDuration : durationOption),
    [customDuration, durationOption],
  )
  const selectableSprints = sprints.filter((sprint) => sprint.status !== 'completed')

  async function createSprint() {
    if (!name.trim()) {
      setError('Sprint name is required.')
      return
    }
    if (!Number.isFinite(durationDays) || durationDays <= 0) {
      setError('Sprint duration must be greater than zero.')
      return
    }
    setError('')
    await onCreate({ name: name.trim(), durationDays })
    setName('')
    setDurationOption(10)
    setCustomDuration(10)
  }

  return (
    <Card padding="0" style={{ overflow: 'hidden' }}>
      <div className="border-b border-[var(--line)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Sprint</p>
            <h2 className="mt-1 text-xl font-bold text-[var(--ink)]">{activeSprint?.name ?? 'No active sprint'}</h2>
          </div>
          {activeSprint ? <Badge variant="accent">{activeSprint.durationDays} days</Badge> : null}
        </div>
      </div>

      {isAdmin ? (
        <div className="grid gap-3 p-5">
          <label className="text-sm font-semibold text-[var(--ink)]" htmlFor="sprint-name">
            Create sprint
          </label>
          <input
            id="sprint-name"
            className="rounded-lg border border-[var(--line-strong)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)]"
            onChange={(event) => setName(event.target.value)}
            placeholder="Sprint 16"
            value={name}
          />
          <div className="grid gap-2 sm:grid-cols-[1fr_120px]">
            <select
              className="rounded-lg border border-[var(--line-strong)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)]"
              onChange={(event) => {
                const value = event.target.value
                setDurationOption(value === 'custom' ? 'custom' : Number(value) === 5 ? 5 : 10)
              }}
              value={durationOption}
            >
              {durationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {durationOption === 'custom' ? (
              <input
                className="rounded-lg border border-[var(--line-strong)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)]"
                min={1}
                onChange={(event) => setCustomDuration(Number(event.target.value))}
                type="number"
                value={customDuration}
              />
            ) : null}
          </div>
          {error ? <p className="text-sm text-[var(--error)]">{error}</p> : null}
          <div className="flex flex-wrap gap-2">
            <button className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white" onClick={() => void createSprint()}>
              Create and select
            </button>
            {activeSprint && activeSprint.status !== 'completed' ? (
              <button
                className="rounded-lg border border-[var(--line-strong)] px-4 py-2 text-sm font-bold text-[var(--ink)]"
                onClick={() => void onComplete()}
              >
                Complete sprint
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="border-t border-[var(--line)] p-3">
        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Available sprints</p>
        {selectableSprints.length === 0 ? (
          <EmptyState message="No active sprint records yet." />
        ) : (
          <div className="grid max-h-64 gap-1 overflow-y-auto pr-1">
            {selectableSprints.map((sprint) => (
              <ListRow
                key={sprint.id}
                onClick={isAdmin ? () => void onSelect(sprint.id) : undefined}
                subtitle={`${sprint.durationDays} days · ${sprint.totalFinalStoryPoints} pts`}
                title={sprint.name}
                trailing={sprint.id === activeSprint?.id ? <Badge variant="accent">Selected</Badge> : null}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
