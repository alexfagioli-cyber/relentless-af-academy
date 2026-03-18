-- RelentlessAF Academy — Phase 2 Assessment Seed
-- 3 assessments, one per tier
-- questions JSONB contains correctAnswer (server-side only — stripped before client delivery)

-- Re-create helper for deterministic UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE OR REPLACE FUNCTION module_uuid(short_id TEXT)
RETURNS UUID AS $$
  SELECT uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'relentlessaf-' || short_id);
$$ LANGUAGE sql IMMUTABLE;

-- ============================================================
-- Assessment: AI Basics (module A03, Aware tier)
-- Pass: 70%, Time: 15 minutes, 6 questions
-- ============================================================
INSERT INTO assessments (id, module_id, title, pass_score, time_limit_mins, questions) VALUES (
  gen_random_uuid(),
  module_uuid('A03'),
  'Assessment: AI Basics',
  70,
  15,
  '{
    "title": "AI Basics",
    "showProgressBar": "bottom",
    "elements": [
      {
        "type": "radiogroup",
        "name": "q1_what_is_claude",
        "title": "What is Claude?",
        "choices": [
          "A chatbot made by OpenAI",
          "An AI assistant made by Anthropic",
          "A search engine",
          "A programming language"
        ],
        "correctAnswer": "An AI assistant made by Anthropic"
      },
      {
        "type": "radiogroup",
        "name": "q2_verify_facts",
        "title": "What should you do if AI gives you an important fact?",
        "choices": [
          "Trust it completely",
          "Verify it from another source",
          "Ignore it",
          "Ask the AI to confirm it"
        ],
        "correctAnswer": "Verify it from another source"
      },
      {
        "type": "radiogroup",
        "name": "q3_ai_help",
        "title": "Which of these is something AI can help with?",
        "choices": [
          "Summarising long documents",
          "Predicting the future with certainty",
          "Replacing human judgement entirely",
          "Accessing private databases"
        ],
        "correctAnswer": "Summarising long documents"
      },
      {
        "type": "radiogroup",
        "name": "q4_hallucination",
        "title": "What is a ''hallucination'' in AI?",
        "choices": [
          "When AI creates images",
          "When AI generates confident but incorrect information",
          "When AI refuses to answer",
          "When AI runs too slowly"
        ],
        "correctAnswer": "When AI generates confident but incorrect information"
      },
      {
        "type": "radiogroup",
        "name": "q5_good_prompt",
        "title": "What makes a good prompt?",
        "choices": [
          "Being as brief as possible",
          "Giving clear context and specific instructions",
          "Using technical jargon",
          "Asking multiple unrelated questions at once"
        ],
        "correctAnswer": "Giving clear context and specific instructions"
      },
      {
        "type": "radiogroup",
        "name": "q6_training_data",
        "title": "AI models like Claude are trained on...",
        "choices": [
          "Live internet data in real-time",
          "Large datasets of text, with a knowledge cutoff date",
          "Only scientific papers",
          "Data you provide in your conversations"
        ],
        "correctAnswer": "Large datasets of text, with a knowledge cutoff date"
      }
    ]
  }'::jsonb
);

-- ============================================================
-- Assessment: Applied Prompting (module E03, Enabled tier)
-- Pass: 70%, Time: 20 minutes, 7 questions
-- ============================================================
INSERT INTO assessments (id, module_id, title, pass_score, time_limit_mins, questions) VALUES (
  gen_random_uuid(),
  module_uuid('E03'),
  'Assessment: Applied Prompting',
  70,
  20,
  '{
    "title": "Applied Prompting",
    "showProgressBar": "bottom",
    "elements": [
      {
        "type": "radiogroup",
        "name": "q1_role",
        "title": "What is the main benefit of giving AI a ''role'' in your prompt?",
        "choices": [
          "It makes the AI respond faster",
          "It shapes the perspective and expertise of the response",
          "It reduces the cost of the API call",
          "It prevents hallucinations completely"
        ],
        "correctAnswer": "It shapes the perspective and expertise of the response"
      },
      {
        "type": "radiogroup",
        "name": "q2_useful_prompt",
        "title": "Which prompt is most likely to get a useful response?",
        "choices": [
          "Write something about marketing",
          "Write a 200-word LinkedIn post for a B2B SaaS company launching a new analytics feature, targeting CTOs, in a professional but conversational tone",
          "Marketing content please",
          "Write the best marketing copy ever"
        ],
        "correctAnswer": "Write a 200-word LinkedIn post for a B2B SaaS company launching a new analytics feature, targeting CTOs, in a professional but conversational tone"
      },
      {
        "type": "radiogroup",
        "name": "q3_few_shot",
        "title": "What is ''few-shot prompting''?",
        "choices": [
          "Asking the AI to respond briefly",
          "Providing examples of desired input/output pairs in the prompt",
          "Using the AI for a limited number of tasks",
          "A technique for reducing API costs"
        ],
        "correctAnswer": "Providing examples of desired input/output pairs in the prompt"
      },
      {
        "type": "radiogroup",
        "name": "q4_break_task",
        "title": "When should you break a complex task into multiple prompts?",
        "choices": [
          "Never — AI works best with everything in one prompt",
          "When the task has distinct stages that build on each other",
          "Only when the response is too long",
          "When you want to test different models"
        ],
        "correctAnswer": "When the task has distinct stages that build on each other"
      },
      {
        "type": "radiogroup",
        "name": "q5_chain_of_thought",
        "title": "What is ''chain-of-thought'' prompting?",
        "choices": [
          "Linking multiple AI models together",
          "Asking the AI to explain its reasoning step by step",
          "Using AI to generate a sequence of social media posts",
          "A technique for training AI models"
        ],
        "correctAnswer": "Asking the AI to explain its reasoning step by step"
      },
      {
        "type": "radiogroup",
        "name": "q6_context",
        "title": "Which approach best helps AI maintain context in a long conversation?",
        "choices": [
          "Starting every message with ''Remember what I said earlier''",
          "Periodically summarising the conversation state and key decisions",
          "Using shorter messages",
          "Switching to a different AI model"
        ],
        "correctAnswer": "Periodically summarising the conversation state and key decisions"
      },
      {
        "type": "radiogroup",
        "name": "q7_output_constraints",
        "title": "What is the purpose of output constraints in a prompt?",
        "choices": [
          "To make the AI work harder",
          "To specify the format, length, style, or structure of the response",
          "To limit the AI''s knowledge",
          "To reduce processing time"
        ],
        "correctAnswer": "To specify the format, length, style, or structure of the response"
      }
    ]
  }'::jsonb
);

-- ============================================================
-- Assessment: Specialist Readiness (module S14, Specialist tier)
-- Pass: 75%, Time: 30 minutes, 8 questions
-- ============================================================
INSERT INTO assessments (id, module_id, title, pass_score, time_limit_mins, questions) VALUES (
  gen_random_uuid(),
  module_uuid('S14'),
  'Assessment: Specialist Readiness',
  75,
  30,
  '{
    "title": "Specialist Readiness",
    "showProgressBar": "bottom",
    "elements": [
      {
        "type": "radiogroup",
        "name": "q1_system_param",
        "title": "In the Claude API, what is the purpose of the ''system'' parameter?",
        "choices": [
          "To specify which Claude model to use",
          "To set persistent instructions that guide the assistant''s behaviour",
          "To authenticate the API request",
          "To limit the response length"
        ],
        "correctAnswer": "To set persistent instructions that guide the assistant''s behaviour"
      },
      {
        "type": "radiogroup",
        "name": "q2_mcp",
        "title": "What is MCP (Model Context Protocol)?",
        "choices": [
          "A method for compressing AI model weights",
          "A protocol that lets AI models connect to external tools and data sources",
          "A security protocol for encrypting AI conversations",
          "A standard for training AI models on custom data"
        ],
        "correctAnswer": "A protocol that lets AI models connect to external tools and data sources"
      },
      {
        "type": "radiogroup",
        "name": "q3_tool_building",
        "title": "When building a tool for Claude to use, what must you provide?",
        "choices": [
          "Only the tool''s name",
          "A name, description, and input schema so Claude knows when and how to use it",
          "The tool''s source code",
          "A training dataset for the tool"
        ],
        "correctAnswer": "A name, description, and input schema so Claude knows when and how to use it"
      },
      {
        "type": "radiogroup",
        "name": "q4_streaming",
        "title": "What is the main advantage of streaming responses from the Claude API?",
        "choices": [
          "It''s cheaper per token",
          "Users see partial results immediately instead of waiting for the full response",
          "It allows longer responses",
          "It improves accuracy"
        ],
        "correctAnswer": "Users see partial results immediately instead of waiting for the full response"
      },
      {
        "type": "radiogroup",
        "name": "q5_constitutional_ai",
        "title": "In prompt engineering, what is ''constitutional AI''?",
        "choices": [
          "AI that follows government regulations",
          "A training approach where the AI is guided by a set of principles to be helpful, harmless, and honest",
          "AI that only works in democratic countries",
          "A technique for making AI responses longer"
        ],
        "correctAnswer": "A training approach where the AI is guided by a set of principles to be helpful, harmless, and honest"
      },
      {
        "type": "radiogroup",
        "name": "q6_agent",
        "title": "What is an ''agent'' in the context of AI systems?",
        "choices": [
          "Any AI chatbot",
          "An AI system that can autonomously plan, use tools, and take actions to accomplish goals",
          "A human who manages AI systems",
          "A type of AI model architecture"
        ],
        "correctAnswer": "An AI system that can autonomously plan, use tools, and take actions to accomplish goals"
      },
      {
        "type": "radiogroup",
        "name": "q7_ground_truth",
        "title": "When evaluating AI outputs, what does ''ground truth'' mean?",
        "choices": [
          "The AI''s confidence score",
          "The known correct answer against which AI output is compared",
          "The original training data",
          "The most popular answer among users"
        ],
        "correctAnswer": "The known correct answer against which AI output is compared"
      },
      {
        "type": "radiogroup",
        "name": "q8_agent_tools",
        "title": "What is the key risk of giving an AI agent too many tools?",
        "choices": [
          "Higher API costs",
          "The agent may choose inappropriate tools or take unintended actions due to ambiguity",
          "The agent will run more slowly",
          "The tools will conflict with each other"
        ],
        "correctAnswer": "The agent may choose inappropriate tools or take unintended actions due to ambiguity"
      }
    ]
  }'::jsonb
);

-- Clean up helper function
DROP FUNCTION IF EXISTS module_uuid(TEXT);
