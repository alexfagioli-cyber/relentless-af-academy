-- Phase 7: Content enrichment — new internal modules, updated descriptions, reordered prerequisites

-- Recreate helper function
CREATE OR REPLACE FUNCTION module_uuid(short_id TEXT)
RETURNS UUID AS $$
  SELECT uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'relentlessaf-' || short_id);
$$ LANGUAGE sql IMMUTABLE;

-- ============================================================
-- 1. REORDER existing modules to create gaps for new ones
-- ============================================================

-- Aware tier: A01=2, A02=4, A03=5, A04=7, A05=8, A06=9, A07=10, A08=11, A09=12
UPDATE modules SET order_index = 2  WHERE id = module_uuid('A01');
UPDATE modules SET order_index = 4  WHERE id = module_uuid('A02');
UPDATE modules SET order_index = 5  WHERE id = module_uuid('A03');
UPDATE modules SET order_index = 7  WHERE id = module_uuid('A04');
UPDATE modules SET order_index = 8  WHERE id = module_uuid('A05');
UPDATE modules SET order_index = 9  WHERE id = module_uuid('A06');
UPDATE modules SET order_index = 10 WHERE id = module_uuid('A07');
UPDATE modules SET order_index = 11 WHERE id = module_uuid('A08');
UPDATE modules SET order_index = 12 WHERE id = module_uuid('A09');

-- Enabled tier: E01=14, E02=15, ..., E09=22
UPDATE modules SET order_index = 14 WHERE id = module_uuid('E01');
UPDATE modules SET order_index = 15 WHERE id = module_uuid('E02');
UPDATE modules SET order_index = 16 WHERE id = module_uuid('E03');
UPDATE modules SET order_index = 17 WHERE id = module_uuid('E04');
UPDATE modules SET order_index = 18 WHERE id = module_uuid('E05');
UPDATE modules SET order_index = 19 WHERE id = module_uuid('E06');
UPDATE modules SET order_index = 20 WHERE id = module_uuid('E07');
UPDATE modules SET order_index = 21 WHERE id = module_uuid('E08');
UPDATE modules SET order_index = 22 WHERE id = module_uuid('E09');

-- Specialist tier: S01=24, S02=25, ..., S14=37
UPDATE modules SET order_index = 24 WHERE id = module_uuid('S01');
UPDATE modules SET order_index = 25 WHERE id = module_uuid('S02');
UPDATE modules SET order_index = 26 WHERE id = module_uuid('S03');
UPDATE modules SET order_index = 27 WHERE id = module_uuid('S04');
UPDATE modules SET order_index = 28 WHERE id = module_uuid('S05');
UPDATE modules SET order_index = 29 WHERE id = module_uuid('S06');
UPDATE modules SET order_index = 30 WHERE id = module_uuid('S07');
UPDATE modules SET order_index = 31 WHERE id = module_uuid('S08');
UPDATE modules SET order_index = 32 WHERE id = module_uuid('S09');
UPDATE modules SET order_index = 33 WHERE id = module_uuid('S10');
UPDATE modules SET order_index = 34 WHERE id = module_uuid('S11');
UPDATE modules SET order_index = 35 WHERE id = module_uuid('S12');
UPDATE modules SET order_index = 36 WHERE id = module_uuid('S13');
UPDATE modules SET order_index = 37 WHERE id = module_uuid('S14');

-- ============================================================
-- 2. INSERT new internal modules
-- ============================================================

INSERT INTO modules (id, tier, track, title, description, external_url, platform, order_index, estimated_duration_mins, module_type, content) VALUES

-- A00: Your First AI Moment (new first module)
(module_uuid('A00'), 'aware', 1, 'Your First AI Moment', 'Meet Claude, understand what AI is, and have your first real conversation with it.', NULL, 'internal', 1, 15, 'course',
'{"screens":[{"title":"What is Claude?","body":"Claude is an AI assistant made by Anthropic. It can read, write, analyse, code, research, brainstorm, and reason.\n\nIt''s not a search engine — it''s a thinking partner. The better you learn to work with it, the more powerful it becomes.\n\nThis programme teaches you how to use it properly — from the basics through to professional certification."},{"title":"What makes AI different","body":"AI isn''t magic and it isn''t perfect. It can be confidently wrong — that''s called a hallucination. It has a knowledge cutoff date. It works best when you give it clear context and specific instructions.\n\nLearning to use it well is a genuine skill. The people who develop that skill have an advantage in everything they do — school, work, business, life.\n\nThat''s what you''re here to learn."},{"title":"Your first task","body":"Open your Claude Pro account in a new tab.\n\nAsk it to help you with something real — something you''re actually working on today. A school assignment, a work problem, a decision you''re making, a question you''ve been curious about. Anything.\n\nSpend 10 minutes with it. Have a real conversation. Then come back here.","action":"external_prompt","action_label":"Open Claude","action_url":"https://claude.ai"},{"title":"How was that?","body":"Take a moment to reflect on what just happened.","inputs":[{"key":"what_asked","type":"textarea","label":"What did you ask Claude to help with?","placeholder":"Describe what you tried..."},{"key":"what_surprised","type":"textarea","label":"What surprised you about the response?","placeholder":"Anything unexpected..."},{"key":"usefulness","type":"radio","label":"How useful was it?","options":["Very useful","Somewhat useful","Not very useful"]}]}]}'::jsonb),

-- A01b: What to Look For (after Claude 101)
(module_uuid('A01b'), 'aware', 1, 'What to Look For', 'Key concepts from Claude 101 — making sure the essentials have landed.', NULL, 'internal', 3, 5, 'course',
'{"screens":[{"title":"You''ve just completed Claude 101","body":"Before you move on, let''s make sure the key concepts landed.\n\nClaude 101 covered a lot of ground. The three things that matter most right now:\n\n**1. Claude is a conversation, not a command.** The more context you give, the better the response.\n\n**2. You''re in control.** Claude follows your lead. If the response isn''t right, refine your question — don''t just accept it.\n\n**3. AI has limits.** It can hallucinate. It has a knowledge cutoff. Always verify important facts."},{"title":"Quick check","body":"No scoring — just checking your understanding.","inputs":[{"key":"key_takeaway","type":"textarea","label":"What''s the one thing from Claude 101 that you''ll remember?","placeholder":"The concept that stuck with you..."},{"key":"first_use_idea","type":"textarea","label":"Name one thing you want to try using Claude for this week.","placeholder":"Something specific..."}]}]}'::jsonb),

-- A04b: Prompt Patterns That Work (after A03 assessment)
(module_uuid('A04b'), 'aware', 1, 'Prompt Patterns That Work', 'Five prompt patterns you can use right now to get dramatically better results from Claude.', NULL, 'internal', 6, 10, 'course',
'{"screens":[{"title":"10 prompt patterns you can use right now","body":"Before you dive into the deeper courses, here are patterns that make Claude dramatically more useful. These aren''t theory — they''re templates you can copy and adapt today."},{"title":"Pattern 1: The Role","body":"**Start with who Claude should be.**\n\n\"You are an experienced [teacher / editor / analyst / coach]. Help me with [task].\"\n\nThis shapes the perspective of every response. A teacher explains differently from an analyst."},{"title":"Pattern 2: The Context Dump","body":"**Give Claude everything it needs.**\n\n\"Here''s my situation: [paste details]. Given this context, [your question].\"\n\nThe more relevant context you provide, the more specific and useful the response. Don''t make Claude guess."},{"title":"Pattern 3: The Format Request","body":"**Tell Claude what you want back.**\n\n\"Give me this as [a bullet list / a table / a step-by-step guide / a 200-word summary].\"\n\nFormat control is one of the most underused features. You don''t have to accept whatever Claude gives you."},{"title":"Pattern 4: The Refinement Loop","body":"**Don''t accept the first response.**\n\n\"That''s good but [make it shorter / more specific / less formal / add examples]. Also [additional instruction].\"\n\nThe best results come from 2-3 rounds of refinement, not one perfect prompt."},{"title":"Pattern 5: The Critique Request","body":"**Ask Claude to challenge you.**\n\n\"Here''s my [plan / essay / idea]. What are the weaknesses? What am I missing? Be direct.\"\n\nThis is where AI becomes genuinely powerful — as a thinking partner who spots what you can''t see."},{"title":"Now use them","body":"Pick two of these patterns. Use them with Claude right now on something real. Then come back.","inputs":[{"key":"patterns_used","type":"textarea","label":"Which patterns did you try? What happened?","placeholder":"What you tried and how it went..."},{"key":"favourite_pattern","type":"radio","label":"Which pattern was most useful?","options":["The Role","The Context Dump","The Format Request","The Refinement Loop","The Critique Request"]}]}]}'::jsonb),

-- E00: Why Prompting Changes Everything (first Enabled module)
(module_uuid('E00'), 'enabled', 2, 'Why Prompting Changes Everything', 'Welcome to the Enabled tier — where AI stops being interesting and starts being indispensable.', NULL, 'internal', 13, 10, 'course',
'{"screens":[{"title":"Welcome to Enabled","body":"You''ve completed the Aware tier. You understand what AI is, what it can do, and how to have a useful conversation with it.\n\nThe Enabled tier is where AI stops being interesting and starts being indispensable.\n\nThe difference between someone who \"uses AI\" and someone who''s genuinely AI-enabled is one thing: prompt engineering. Not as a buzzword — as a real, practical skill that changes how you work."},{"title":"What changes at this level","body":"In Aware, you learned to ask Claude questions.\n\nIn Enabled, you''ll learn to:\n\n**Structure complex tasks** — breaking big problems into steps that AI can handle\n\n**Create reusable systems** — prompts and workflows you use every day\n\n**Think in AI-native ways** — approaching problems differently because you have AI as a tool\n\nBy the end of this tier, AI won''t be something you use occasionally. It''ll be something you can''t imagine working without."},{"title":"What''s ahead","body":"The Enabled tier includes:\n\n• A Coursera specialisation on real-world AI application\n• Anthropic''s own prompt engineering tutorials\n• Challenges where you build your personal prompt library and AI workflow\n• Assessments that prove you genuinely understand this material\n\nThis is where the real skills start. Let''s go.","inputs":[{"key":"enabled_goal","type":"textarea","label":"What''s the one thing you most want AI to help you with at this level?","placeholder":"Be specific..."}]}]}'::jsonb),

-- S00: From User to Builder (first Specialist module)
(module_uuid('S00'), 'specialist', 3, 'From User to Builder', 'Welcome to Specialist — where you stop using AI and start building with it.', NULL, 'internal', 23, 10, 'course',
'{"screens":[{"title":"Welcome to Specialist","body":"Most people will never reach this tier. The skills you''re about to develop are the same ones used by engineers at Anthropic, and by the professionals who build AI-powered products and services.\n\nThis is where you stop being someone who uses AI and become someone who builds with it."},{"title":"What changes here","body":"In Enabled, you mastered prompting — talking to AI effectively.\n\nIn Specialist, you''ll learn to:\n\n**Use the Claude API** — call Claude programmatically, not just through a chat interface\n\n**Build with MCP** — connect Claude to real tools, databases, and services\n\n**Create AI agents** — systems that can plan, execute, and verify their own work\n\n**Prepare for certification** — the Claude Certified Architect credential\n\nThis is career-grade material. Take it seriously."},{"title":"Before you start","body":"The Specialist tier involves code. You don''t need to be an expert programmer, but you should be comfortable reading code and following technical instructions.\n\nIf you''re not there yet, that''s fine — the courses will teach you what you need. But know that this tier requires more effort than the previous two.","inputs":[{"key":"specialist_motivation","type":"textarea","label":"Why do you want to reach Specialist level? What will you build?","placeholder":"What''s driving you to go this deep..."}]}]}'::jsonb);

-- ============================================================
-- 3. UPDATE challenge descriptions
-- ============================================================

UPDATE modules SET title = 'Your First Real Conversation',
  description = 'Use Claude to help with something real this week — homework, a work task, a decision, a creative project. Paste your best exchange and reflect on what worked.'
WHERE id = module_uuid('A02');

UPDATE modules SET title = 'Solve a Real Problem',
  description = 'Pick something you''re genuinely stuck on. Use Claude and everything you''ve learned to work through it. Document your process — what you asked, how you refined, what the outcome was.'
WHERE id = module_uuid('A06');

UPDATE modules SET title = 'Build Your AI Toolkit',
  description = 'Set up Claude with custom instructions tailored to your life. Create 3 reusable prompt templates for tasks you do regularly. Test each one and refine until they work reliably.'
WHERE id = module_uuid('A08');

UPDATE modules SET title = 'Build Your Personal AI Assistant',
  description = 'Create a comprehensive custom instruction set that makes Claude work like your personal assistant. Test it across 5 different real tasks. Document what works and what doesn''t.'
WHERE id = module_uuid('E02');

UPDATE modules SET title = 'Your Prompt Library',
  description = 'Build a library of 10 prompts you''ll actually reuse. Categories: research, writing, analysis, decision-making, creative. Test each one on real tasks and rate their effectiveness.'
WHERE id = module_uuid('E06');

UPDATE modules SET title = 'AI in Your Workflow',
  description = 'Map your daily or weekly routine. Identify 3 tasks where AI can save time or improve quality. Build the prompts, use them for a full week, then report: time saved, quality difference, what you''d change.'
WHERE id = module_uuid('E08');

-- ============================================================
-- 4. UPDATE prerequisites — remove old, add new
-- ============================================================

-- Delete prerequisites that are changing
DELETE FROM prerequisites WHERE module_id = module_uuid('A01') AND prerequisite_module_id = module_uuid('A00');  -- doesn't exist yet, no-op
DELETE FROM prerequisites WHERE module_id = module_uuid('A02') AND prerequisite_module_id = module_uuid('A01');  -- A02 now requires A01b
DELETE FROM prerequisites WHERE module_id = module_uuid('A04') AND prerequisite_module_id = module_uuid('A03');  -- A04 now requires A04b
DELETE FROM prerequisites WHERE module_id = module_uuid('A05') AND prerequisite_module_id = module_uuid('A03');  -- A05 now requires A04b
DELETE FROM prerequisites WHERE module_id = module_uuid('E01') AND prerequisite_module_id = module_uuid('A09');  -- E01 now requires E00
DELETE FROM prerequisites WHERE module_id = module_uuid('S01') AND prerequisite_module_id = module_uuid('E09');  -- S01 now requires S00

-- Insert new prerequisites
INSERT INTO prerequisites (module_id, prerequisite_module_id, prerequisite_group) VALUES
-- A00 has no prerequisites (it's the new first module)
-- A01 now requires A00
(module_uuid('A01'), module_uuid('A00'), 0),
-- A01b requires A01
(module_uuid('A01b'), module_uuid('A01'), 0),
-- A02 now requires A01b (was: A01)
(module_uuid('A02'), module_uuid('A01b'), 0),
-- A04b requires A03
(module_uuid('A04b'), module_uuid('A03'), 0),
-- A04 now requires A04b (was: A03)
(module_uuid('A04'), module_uuid('A04b'), 0),
-- A05 now requires A04b (was: A03)
(module_uuid('A05'), module_uuid('A04b'), 0),
-- E00 requires A09
(module_uuid('E00'), module_uuid('A09'), 0),
-- E01 now requires E00 (was: A09)
(module_uuid('E01'), module_uuid('E00'), 0),
-- S00 requires E09
(module_uuid('S00'), module_uuid('E09'), 0),
-- S01 now requires S00 (was: E09)
(module_uuid('S01'), module_uuid('S00'), 0);

-- Clean up helper function
DROP FUNCTION IF EXISTS module_uuid(TEXT);
