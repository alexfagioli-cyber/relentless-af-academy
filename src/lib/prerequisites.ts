// Prerequisite unlock logic
// Same prerequisite_group = AND (all in that group must be completed)
// Different prerequisite_groups = OR (any single group fully satisfied unlocks the module)

interface Prerequisite {
  module_id: string
  prerequisite_module_id: string
  prerequisite_group: number
}

export function computeUnlockedModules(
  allModuleIds: string[],
  prerequisites: Prerequisite[],
  completedModuleIds: Set<string>
): Set<string> {
  const unlocked = new Set<string>()

  for (const moduleId of allModuleIds) {
    const prereqs = prerequisites.filter((p) => p.module_id === moduleId)

    // No prerequisites — always unlocked
    if (prereqs.length === 0) {
      unlocked.add(moduleId)
      continue
    }

    // Group prerequisites by prerequisite_group
    const groups = new Map<number, string[]>()
    for (const p of prereqs) {
      const existing = groups.get(p.prerequisite_group) ?? []
      existing.push(p.prerequisite_module_id)
      groups.set(p.prerequisite_group, existing)
    }

    // OR logic: any single group where ALL prereqs are completed unlocks the module
    let anyGroupSatisfied = false
    for (const [, groupPrereqs] of groups) {
      if (groupPrereqs.every((id) => completedModuleIds.has(id))) {
        anyGroupSatisfied = true
        break
      }
    }

    if (anyGroupSatisfied) {
      unlocked.add(moduleId)
    }
  }

  return unlocked
}
