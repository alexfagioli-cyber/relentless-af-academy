import { describe, it, expect } from 'vitest'

// Extract the scoring logic from the API route so we can test it independently
// This mirrors the exact scoring algorithm in src/app/api/assess/score/route.ts

interface SurveyElement {
  name: string
  correctAnswer?: string
}

function scoreAssessment(
  elements: SurveyElement[],
  answers: Record<string, string>,
  passScore: number
) {
  const totalQuestions = elements.length
  let correctCount = 0

  for (const element of elements) {
    if (element.correctAnswer && answers[element.name] === element.correctAnswer) {
      correctCount++
    }
  }

  const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0
  const passed = score >= passScore

  const review = elements.map((element) => ({
    name: element.name,
    yourAnswer: answers[element.name] ?? null,
    correctAnswer: element.correctAnswer ?? null,
    correct: element.correctAnswer ? answers[element.name] === element.correctAnswer : true,
  }))

  return {
    score: Math.round(score * 100) / 100,
    passed,
    total_questions: totalQuestions,
    correct_count: correctCount,
    review,
  }
}

describe('Assessment Scoring', () => {
  const questions: SurveyElement[] = [
    { name: 'q1', correctAnswer: 'A' },
    { name: 'q2', correctAnswer: 'B' },
    { name: 'q3', correctAnswer: 'C' },
    { name: 'q4', correctAnswer: 'D' },
    { name: 'q5', correctAnswer: 'A' },
  ]

  it('scores 100% when all answers correct', () => {
    const result = scoreAssessment(questions, { q1: 'A', q2: 'B', q3: 'C', q4: 'D', q5: 'A' }, 70)
    expect(result.score).toBe(100)
    expect(result.passed).toBe(true)
    expect(result.correct_count).toBe(5)
    expect(result.total_questions).toBe(5)
  })

  it('scores 0% when all answers wrong', () => {
    const result = scoreAssessment(questions, { q1: 'X', q2: 'X', q3: 'X', q4: 'X', q5: 'X' }, 70)
    expect(result.score).toBe(0)
    expect(result.passed).toBe(false)
    expect(result.correct_count).toBe(0)
  })

  it('scores partial correctly', () => {
    const result = scoreAssessment(questions, { q1: 'A', q2: 'B', q3: 'X', q4: 'X', q5: 'X' }, 70)
    expect(result.score).toBe(40)
    expect(result.passed).toBe(false)
    expect(result.correct_count).toBe(2)
  })

  it('passes at exactly the pass threshold', () => {
    // 4/5 = 80%, pass score 80
    const result = scoreAssessment(questions, { q1: 'A', q2: 'B', q3: 'C', q4: 'D', q5: 'X' }, 80)
    expect(result.score).toBe(80)
    expect(result.passed).toBe(true)
  })

  it('fails just below the pass threshold', () => {
    // 3/5 = 60%, pass score 70
    const result = scoreAssessment(questions, { q1: 'A', q2: 'B', q3: 'C', q4: 'X', q5: 'X' }, 70)
    expect(result.score).toBe(60)
    expect(result.passed).toBe(false)
  })

  it('handles unanswered questions', () => {
    const result = scoreAssessment(questions, { q1: 'A' }, 70)
    expect(result.correct_count).toBe(1)
    expect(result.total_questions).toBe(5)
    expect(result.score).toBe(20)
  })

  it('handles empty question set', () => {
    const result = scoreAssessment([], {}, 70)
    expect(result.score).toBe(0)
    expect(result.total_questions).toBe(0)
    expect(result.passed).toBe(false)
  })

  it('builds correct review with right/wrong indicators', () => {
    const result = scoreAssessment(questions, { q1: 'A', q2: 'X' }, 70)
    expect(result.review[0]).toEqual({ name: 'q1', yourAnswer: 'A', correctAnswer: 'A', correct: true })
    expect(result.review[1]).toEqual({ name: 'q2', yourAnswer: 'X', correctAnswer: 'B', correct: false })
    expect(result.review[2]).toEqual({ name: 'q3', yourAnswer: null, correctAnswer: 'C', correct: false })
  })
})
