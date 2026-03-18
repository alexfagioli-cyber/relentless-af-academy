import { setup, createActor } from 'xstate'

// Module progression statechart
// locked → available → in_progress → assessment → passed → completed
//                                  ↘ failed (retry → available)
//
// This machine doesn't persist state — it's computed from DB state on each render.

export type ModuleState = 'locked' | 'available' | 'in_progress' | 'assessment' | 'passed' | 'failed' | 'completed'

interface ProgressionInput {
  prerequisitesMet: boolean
  hasStarted: boolean
  moduleType: string
  hasAssessment: boolean
  progressStatus: string | null
  hasPassed: boolean
  hasFailed: boolean
}

const progressionMachine = setup({
  types: {
    context: {} as ProgressionInput,
    input: {} as ProgressionInput,
  },
  guards: {
    canUnlock: ({ context }) => context.prerequisitesMet,
    isStarted: ({ context }) => context.hasStarted,
    isAssessmentModule: ({ context }) => context.moduleType === 'assessment' && context.hasAssessment,
    hasPassedAssessment: ({ context }) => context.hasPassed,
    hasFailedAssessment: ({ context }) => context.hasFailed,
    isCompleted: ({ context }) => context.progressStatus === 'completed',
  },
}).createMachine({
  id: 'progression',
  initial: 'determining',
  context: ({ input }) => ({ ...input }),
  states: {
    determining: {
      always: [
        { target: 'completed', guard: 'isCompleted' },
        { target: 'passed', guard: 'hasPassedAssessment' },
        { target: 'failed', guard: 'hasFailedAssessment' },
        { target: 'assessment', guard: 'isAssessmentModule' },
        { target: 'in_progress', guard: 'isStarted' },
        { target: 'available', guard: 'canUnlock' },
        { target: 'locked' },
      ],
    },
    locked: { type: 'final' },
    available: { type: 'final' },
    in_progress: { type: 'final' },
    assessment: { type: 'final' },
    passed: { type: 'final' },
    failed: { type: 'final' },
    completed: { type: 'final' },
  },
})

export function computeModuleState(input: ProgressionInput): ModuleState {
  const actor = createActor(progressionMachine, { input })
  actor.start()
  const state = actor.getSnapshot().value as ModuleState
  actor.stop()
  return state
}

// Convenience: compute state from database data
export function getModuleState(params: {
  prerequisitesMet: boolean
  moduleType: string
  hasAssessment: boolean
  progressStatus: string | null
  bestAttemptPassed: boolean | null
  hasFailedAttempt: boolean
}): ModuleState {
  return computeModuleState({
    prerequisitesMet: params.prerequisitesMet,
    hasStarted: params.progressStatus === 'in_progress' || params.progressStatus === 'failed',
    moduleType: params.moduleType,
    hasAssessment: params.hasAssessment,
    progressStatus: params.progressStatus,
    hasPassed: params.bestAttemptPassed === true,
    hasFailed: params.hasFailedAttempt && params.bestAttemptPassed !== true,
  })
}
