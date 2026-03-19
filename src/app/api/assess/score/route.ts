import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface ScoreRequest {
  assessmentId: string
  answers: Record<string, string>
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Verify authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let body: ScoreRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { assessmentId, answers } = body
  if (!assessmentId || !answers) {
    return NextResponse.json({ error: 'Missing assessmentId or answers' }, { status: 400 })
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(assessmentId)) {
    return NextResponse.json({ error: 'Invalid assessmentId format' }, { status: 400 })
  }

  // Fetch assessment with correct answers (server-side only — never sent to client)
  const { data: assessment, error: fetchError } = await supabase
    .from('assessments')
    .select('id, module_id, pass_score, questions')
    .eq('id', assessmentId)
    .single()

  if (fetchError || !assessment) {
    return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
  }

  // Score the submission
  const surveyJson = assessment.questions as { elements?: Array<{ name: string; correctAnswer?: string }> }
  const elements = surveyJson.elements ?? []
  const totalQuestions = elements.length

  let correctCount = 0
  for (const element of elements) {
    if (element.correctAnswer && answers[element.name] === element.correctAnswer) {
      correctCount++
    }
  }

  const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0
  const passed = score >= (assessment.pass_score ?? 70)

  // Insert assessment attempt
  const { error: attemptError } = await supabase
    .from('assessment_attempts')
    .insert({
      learner_id: user.id,
      assessment_id: assessmentId,
      answers,
      score,
      passed,
    })

  if (attemptError) {
    return NextResponse.json({ error: 'Failed to save attempt' }, { status: 500 })
  }

  // Check existing progress — never downgrade a pass to a fail
  const { data: existingProgress } = await supabase
    .from('progress')
    .select('status, score')
    .eq('learner_id', user.id)
    .eq('module_id', assessment.module_id)
    .single()

  const alreadyPassed = existingProgress?.status === 'completed'

  // Update progress (preserve completed status if already passed)
  await supabase
    .from('progress')
    .upsert({
      learner_id: user.id,
      module_id: assessment.module_id,
      status: alreadyPassed || passed ? 'completed' : 'failed',
      started_at: new Date().toISOString(),
      completed_at: alreadyPassed || passed ? new Date().toISOString() : null,
      score: alreadyPassed ? Math.max(existingProgress.score ?? 0, score) : score,
      attempts: 1,
    }, { onConflict: 'learner_id,module_id' })

  // Log learning_events: attempted, then passed or failed
  await supabase
    .from('learning_events')
    .insert([
      {
        learner_id: user.id,
        verb: 'attempted',
        object_type: 'assessment',
        object_id: assessment.module_id,
        result: { score, correct_count: correctCount, total_questions: totalQuestions },
      },
      {
        learner_id: user.id,
        verb: passed ? 'passed' : 'failed',
        object_type: 'assessment',
        object_id: assessment.module_id,
        result: { score, passed },
      },
    ])

  // Update streak on pass
  if (passed) {
    const { updateStreak } = await import('@/lib/streak')
    await updateStreak(supabase, user.id)
  }

  // Build per-question review (safe to send after submission — answers already locked in)
  const review = elements.map((element) => ({
    name: element.name,
    yourAnswer: answers[element.name] ?? null,
    correctAnswer: element.correctAnswer ?? null,
    correct: element.correctAnswer ? answers[element.name] === element.correctAnswer : true,
  }))

  return NextResponse.json({
    score: Math.round(score * 100) / 100,
    passed,
    total_questions: totalQuestions,
    correct_count: correctCount,
    review,
  })
}
