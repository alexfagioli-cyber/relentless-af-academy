import { describe, it, expect } from 'vitest'
import { computeUnlockedModules } from '@/lib/prerequisites'

describe('computeUnlockedModules', () => {
  const modules = ['m1', 'm2', 'm3', 'm4', 'm5']

  it('unlocks modules with no prerequisites', () => {
    const result = computeUnlockedModules(modules, [], new Set())
    expect(result).toEqual(new Set(modules))
  })

  it('locks a module when its prerequisite is not completed', () => {
    const prereqs = [{ module_id: 'm2', prerequisite_module_id: 'm1', prerequisite_group: 1 }]
    const result = computeUnlockedModules(modules, prereqs, new Set())
    expect(result.has('m1')).toBe(true)
    expect(result.has('m2')).toBe(false)
  })

  it('unlocks a module when its prerequisite is completed', () => {
    const prereqs = [{ module_id: 'm2', prerequisite_module_id: 'm1', prerequisite_group: 1 }]
    const result = computeUnlockedModules(modules, prereqs, new Set(['m1']))
    expect(result.has('m2')).toBe(true)
  })

  it('requires ALL prerequisites in the same group (AND logic)', () => {
    const prereqs = [
      { module_id: 'm3', prerequisite_module_id: 'm1', prerequisite_group: 1 },
      { module_id: 'm3', prerequisite_module_id: 'm2', prerequisite_group: 1 },
    ]
    // Only m1 completed — m3 should be locked
    const partial = computeUnlockedModules(modules, prereqs, new Set(['m1']))
    expect(partial.has('m3')).toBe(false)

    // Both completed — m3 should be unlocked
    const full = computeUnlockedModules(modules, prereqs, new Set(['m1', 'm2']))
    expect(full.has('m3')).toBe(true)
  })

  it('unlocks when ANY group is fully satisfied (OR logic)', () => {
    const prereqs = [
      { module_id: 'm4', prerequisite_module_id: 'm1', prerequisite_group: 1 },
      { module_id: 'm4', prerequisite_module_id: 'm2', prerequisite_group: 1 },
      { module_id: 'm4', prerequisite_module_id: 'm3', prerequisite_group: 2 },
    ]
    // Group 1 needs m1+m2, group 2 needs m3. Only m3 completed — group 2 satisfied
    const result = computeUnlockedModules(modules, prereqs, new Set(['m3']))
    expect(result.has('m4')).toBe(true)
  })

  it('stays locked when no group is fully satisfied', () => {
    const prereqs = [
      { module_id: 'm4', prerequisite_module_id: 'm1', prerequisite_group: 1 },
      { module_id: 'm4', prerequisite_module_id: 'm2', prerequisite_group: 1 },
      { module_id: 'm4', prerequisite_module_id: 'm3', prerequisite_group: 2 },
    ]
    // Only m1 completed — neither group satisfied
    const result = computeUnlockedModules(modules, prereqs, new Set(['m1']))
    expect(result.has('m4')).toBe(false)
  })
})
