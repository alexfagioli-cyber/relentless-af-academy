import { describe, it, expect } from 'vitest'

// Mirrors the sort logic from src/app/learn/page.tsx
// Completed modules sink to bottom, everything else preserves order_index

type ModuleStatus = 'completed' | 'in_progress' | 'available' | 'locked'

interface ModuleWithStatus {
  id: string
  status: ModuleStatus
  order_index: number
}

function sortModules(modules: ModuleWithStatus[]): ModuleWithStatus[] {
  return [...modules].sort((a, b) => {
    const aCompleted = a.status === 'completed' ? 1 : 0
    const bCompleted = b.status === 'completed' ? 1 : 0
    if (aCompleted !== bCompleted) return aCompleted - bCompleted
    return a.order_index - b.order_index
  })
}

describe('Learn Page Sort', () => {
  it('preserves order_index when no modules are completed', () => {
    const modules: ModuleWithStatus[] = [
      { id: 'm1', status: 'available', order_index: 1 },
      { id: 'm2', status: 'in_progress', order_index: 2 },
      { id: 'm3', status: 'locked', order_index: 3 },
    ]
    const sorted = sortModules(modules)
    expect(sorted.map(m => m.id)).toEqual(['m1', 'm2', 'm3'])
  })

  it('sinks completed modules to bottom', () => {
    const modules: ModuleWithStatus[] = [
      { id: 'm1', status: 'completed', order_index: 1 },
      { id: 'm2', status: 'available', order_index: 2 },
      { id: 'm3', status: 'in_progress', order_index: 3 },
    ]
    const sorted = sortModules(modules)
    expect(sorted.map(m => m.id)).toEqual(['m2', 'm3', 'm1'])
  })

  it('preserves order among completed modules', () => {
    const modules: ModuleWithStatus[] = [
      { id: 'm1', status: 'completed', order_index: 1 },
      { id: 'm2', status: 'completed', order_index: 2 },
      { id: 'm3', status: 'available', order_index: 3 },
    ]
    const sorted = sortModules(modules)
    expect(sorted.map(m => m.id)).toEqual(['m3', 'm1', 'm2'])
  })

  it('preserves learning sequence — in_progress stays in place', () => {
    const modules: ModuleWithStatus[] = [
      { id: 'm1', status: 'completed', order_index: 1 },
      { id: 'm2', status: 'completed', order_index: 2 },
      { id: 'm3', status: 'in_progress', order_index: 3 },
      { id: 'm4', status: 'available', order_index: 4 },
      { id: 'm5', status: 'locked', order_index: 5 },
    ]
    const sorted = sortModules(modules)
    // Non-completed in original order, then completed in original order
    expect(sorted.map(m => m.id)).toEqual(['m3', 'm4', 'm5', 'm1', 'm2'])
  })

  it('handles all completed', () => {
    const modules: ModuleWithStatus[] = [
      { id: 'm1', status: 'completed', order_index: 1 },
      { id: 'm2', status: 'completed', order_index: 2 },
    ]
    const sorted = sortModules(modules)
    expect(sorted.map(m => m.id)).toEqual(['m1', 'm2'])
  })

  it('handles empty list', () => {
    expect(sortModules([])).toEqual([])
  })
})
