-- Fix Aware tier assessments — addresses Sam's feedback (19 March 2026)
-- 1. A07: Replace duplicate questions with distinct framework-focused scenarios
-- 2. A08: Add structured challenge guidance
-- 3. A09: Create missing tier gate assessment

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE OR REPLACE FUNCTION module_uuid(short_id TEXT)
RETURNS UUID AS $$
  SELECT uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'relentlessaf-' || short_id);
$$ LANGUAGE sql IMMUTABLE;

-- ============================================================
-- A07: Rewrite assessment — Frameworks Applied
-- All 6 questions now test applied framework thinking, zero overlap with A03
-- ============================================================
UPDATE assessments
SET questions = '{
  "title": "Frameworks Applied",
  "showProgressBar": "bottom",
  "elements": [
    {
      "type": "radiogroup",
      "name": "q1_risk_assessment",
      "title": "You are deciding whether to use AI for a task. Which question is MOST important to ask first?",
      "choices": [
        "How fast will the AI respond?",
        "What would happen if the AI got this wrong?",
        "Which AI model is cheapest?",
        "Has anyone else used AI for this before?"
      ],
      "correctAnswer": "What would happen if the AI got this wrong?"
    },
    {
      "type": "radiogroup",
      "name": "q2_appropriate_use",
      "title": "A friend says they asked Claude to diagnose a health symptom and followed its advice. What is the best response from an AI fluency perspective?",
      "choices": [
        "Claude is quite knowledgeable about health, so that is probably fine",
        "AI should never be used for anything health-related",
        "AI can help research health topics, but medical decisions should always involve a qualified professional",
        "They should have used a medical AI instead of Claude"
      ],
      "correctAnswer": "AI can help research health topics, but medical decisions should always involve a qualified professional"
    },
    {
      "type": "radiogroup",
      "name": "q3_context_window",
      "title": "You have been using Claude for a project and its responses are getting less focused. What is the most likely cause?",
      "choices": [
        "The AI is running out of processing power",
        "The conversation has grown long and Claude is losing track of the key context",
        "You need to upgrade to a better model",
        "Claude is designed to give shorter answers over time"
      ],
      "correctAnswer": "The conversation has grown long and Claude is losing track of the key context"
    },
    {
      "type": "radiogroup",
      "name": "q4_thought_partner",
      "title": "Which of these is the BEST example of using AI as a thought partner?",
      "choices": [
        "Asking Claude to make a decision for you",
        "Giving Claude a problem and asking it to explore different angles, then using those perspectives to inform YOUR decision",
        "Asking Claude to predict the outcome of your decision",
        "Asking Claude to find someone who has solved this problem before"
      ],
      "correctAnswer": "Giving Claude a problem and asking it to explore different angles, then using those perspectives to inform YOUR decision"
    },
    {
      "type": "radiogroup",
      "name": "q5_output_specification",
      "title": "When is it MOST important to tell Claude what format you want the output in?",
      "choices": [
        "Only when writing formal documents",
        "When the output will be used directly in your work — emails, reports, presentations",
        "It never matters — Claude always picks the right format",
        "Only when you want bullet points"
      ],
      "correctAnswer": "When the output will be used directly in your work — emails, reports, presentations"
    },
    {
      "type": "radiogroup",
      "name": "q6_iterative_refinement",
      "title": "You tried using AI for a task and it did not work well. What is the best next step?",
      "choices": [
        "Conclude that AI cannot do this type of task",
        "Try a different AI tool",
        "Rethink your prompt — add more context, break the task down, or try a different approach",
        "Ask someone else to try the same prompt"
      ],
      "correctAnswer": "Rethink your prompt — add more context, break the task down, or try a different approach"
    }
  ]
}'::jsonb
WHERE module_id = module_uuid('A07');

-- ============================================================
-- A08: Add structured challenge guidance
-- ============================================================
UPDATE modules
SET content = '{
  "guidance": [
    {
      "title": "What is this challenge?",
      "body": "You are going to set up Claude as a personal tool — something you can come back to again and again. Think of it like creating shortcuts for the tasks you do most often."
    },
    {
      "title": "Step 1: Pick your tasks",
      "body": "Think about 3 things you do regularly that involve writing, thinking, or organising. Here are some ideas to get you started:",
      "examples": [
        "Writing emails — especially ones you put off because they need the right tone",
        "Summarising meeting notes or long documents",
        "Planning meals, trips, or weekly schedules",
        "Helping your kids with homework topics you are rusty on",
        "Drafting social media posts or messages",
        "Researching a purchase — comparing options, pros and cons",
        "Preparing for a conversation you are nervous about"
      ]
    },
    {
      "title": "Step 2: Build a prompt template for each one",
      "body": "A prompt template is a reusable message you can tweak each time. The key ingredients: tell Claude WHO it should be (role), WHAT you need (task), and HOW you want it (format/tone). Here is an example:",
      "examples": [
        "Example: You are my personal email assistant. I need to write a [professional/casual/apologetic] email to [person] about [topic]. Keep it under 150 words and match my usual tone — direct but warm."
      ]
    },
    {
      "title": "Step 3: Test and refine",
      "body": "Try each template with a real task. If the result is not quite right, tweak the prompt — add more context, change the tone, or be more specific about what you want. The goal is to get it working well enough that you would actually use it again."
    },
    {
      "title": "What to write below",
      "body": "Share which 3 tasks you chose, one of your prompt templates, and what happened when you tested it. What worked? What did you have to adjust?"
    }
  ]
}'::jsonb
WHERE id = module_uuid('A08');

-- ============================================================
-- A09: Create tier gate assessment — 8 questions, 75%, 20 mins
-- Comprehensive across entire Aware tier, no overlap with A03 or A07
-- ============================================================
INSERT INTO assessments (id, module_id, title, pass_score, time_limit_mins, questions) VALUES (
  gen_random_uuid(),
  module_uuid('A09'),
  'Tier Gate: Aware Completion',
  75,
  20,
  '{
    "title": "Aware Completion",
    "showProgressBar": "bottom",
    "elements": [
      {
        "type": "radiogroup",
        "name": "q1_human_ai_relationship",
        "title": "Which statement BEST describes the relationship between humans and AI tools?",
        "choices": [
          "AI should do as much work as possible so humans can focus on other things",
          "Humans provide judgement, context, and accountability — AI provides speed, breadth, and consistency",
          "AI is only useful for simple, repetitive tasks",
          "Humans will eventually not need to be involved at all"
        ],
        "correctAnswer": "Humans provide judgement, context, and accountability — AI provides speed, breadth, and consistency"
      },
      {
        "type": "radiogroup",
        "name": "q2_complex_scenario",
        "title": "You want Claude to help you prepare for a difficult conversation with your manager. What approach is most effective?",
        "choices": [
          "Ask: What should I say to my manager?",
          "Describe the situation, what you want to achieve, and the relationship dynamic, then ask Claude to help you think through approaches",
          "Ask Claude to write a script you can memorise",
          "Ask Claude what your manager is likely thinking"
        ],
        "correctAnswer": "Describe the situation, what you want to achieve, and the relationship dynamic, then ask Claude to help you think through approaches"
      },
      {
        "type": "radiogroup",
        "name": "q3_knowledge_limits",
        "title": "What happens when Claude reaches its knowledge cutoff date?",
        "choices": [
          "It stops working until updated",
          "It may not know about events after that date, but can still reason about topics it was trained on",
          "It switches to using live internet data",
          "It tells you it cannot help with any question"
        ],
        "correctAnswer": "It may not know about events after that date, but can still reason about topics it was trained on"
      },
      {
        "type": "radiogroup",
        "name": "q4_adoption_framework",
        "title": "You have been using AI for two weeks and feel overwhelmed by all the things it can do. What is the best approach?",
        "choices": [
          "Try every feature as fast as possible to learn them all",
          "Focus on one or two tasks where AI adds clear value to YOUR work, and build confidence before expanding",
          "Take a break from AI until you feel ready",
          "Watch more tutorial videos before trying again"
        ],
        "correctAnswer": "Focus on one or two tasks where AI adds clear value to YOUR work, and build confidence before expanding"
      },
      {
        "type": "radiogroup",
        "name": "q5_prompt_quality",
        "title": "Your team is debating whether to use AI for customer emails. One person says AI emails sound robotic. What is the most constructive response?",
        "choices": [
          "AI emails are always better than human ones",
          "The quality depends on the prompt — with the right context, tone guidance, and examples, AI can match your voice",
          "AI should never be used for customer-facing communication",
          "Just do not tell customers it was written by AI"
        ],
        "correctAnswer": "The quality depends on the prompt — with the right context, tone guidance, and examples, AI can match your voice"
      },
      {
        "type": "radiogroup",
        "name": "q6_fluency_definition",
        "title": "Which of these approaches demonstrates the STRONGEST AI fluency?",
        "choices": [
          "Using AI for everything possible",
          "Refusing to use AI because you prefer doing things yourself",
          "Knowing which tasks benefit from AI, which do not, and having the skills to use it effectively for the right ones",
          "Being able to name every AI model on the market"
        ],
        "correctAnswer": "Knowing which tasks benefit from AI, which do not, and having the skills to use it effectively for the right ones"
      },
      {
        "type": "radiogroup",
        "name": "q7_data_governance",
        "title": "You shared a confidential document with Claude to get a summary. What should you have considered first?",
        "choices": [
          "Whether Claude would give an accurate summary",
          "Your organisation''s data policy and whether the content is appropriate to share with an AI tool",
          "Whether Claude can read that file format",
          "Nothing — Claude automatically keeps everything confidential"
        ],
        "correctAnswer": "Your organisation''s data policy and whether the content is appropriate to share with an AI tool"
      },
      {
        "type": "radiogroup",
        "name": "q8_continuous_improvement",
        "title": "After completing the Aware tier, what is the single most valuable habit to build?",
        "choices": [
          "Using AI every day for as many tasks as possible",
          "Keeping up with every new AI model release",
          "Consistently reflecting on what worked, what did not, and refining your approach",
          "Teaching others to use AI before you have mastered it yourself"
        ],
        "correctAnswer": "Consistently reflecting on what worked, what did not, and refining your approach"
      }
    ]
  }'::jsonb
);

-- Clean up
DROP FUNCTION IF EXISTS module_uuid(TEXT);
