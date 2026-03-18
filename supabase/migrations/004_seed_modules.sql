-- RelentlessAF Academy — Phase 1 Curriculum Seed
-- 32 modules across 3 tiers, with prerequisite DAG

-- Generate deterministic UUIDs from short IDs so prerequisites can reference them
-- Using uuid_generate_v5 with DNS namespace as a stable seed

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper: generate a deterministic UUID from a module short ID
CREATE OR REPLACE FUNCTION module_uuid(short_id TEXT)
RETURNS UUID AS $$
  SELECT uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'relentlessaf-' || short_id);
$$ LANGUAGE sql IMMUTABLE;

-- ============================================================
-- AWARE TIER (Track 1) — 9 modules
-- ============================================================

INSERT INTO modules (id, tier, track, title, description, external_url, platform, order_index, estimated_duration_mins, module_type) VALUES
(module_uuid('A01'), 'aware', 1, 'Claude 101', 'Introduction to Claude — what it is, how it works, and your first conversations.', 'https://anthropic.skilljar.com/claude-101', 'skilljar', 1, 210, 'course'),
(module_uuid('A02'), 'aware', 1, 'Challenge: First Conversation', 'Have your first real conversation with Claude. Ask it something you genuinely want to know.', NULL, 'internal', 2, 30, 'challenge'),
(module_uuid('A03'), 'aware', 1, 'Assessment: AI Basics', 'Test your understanding of AI fundamentals from Claude 101.', NULL, 'internal', 3, 15, 'assessment'),
(module_uuid('A04'), 'aware', 1, 'AI Fluency: Framework & Foundations', 'Deep dive into AI frameworks — how to think about AI capabilities and limitations.', 'https://anthropic.skilljar.com/ai-fluency-framework', 'skilljar', 4, 210, 'course'),
(module_uuid('A05'), 'aware', 1, 'AI Fluency for Students', 'AI fluency tailored for students — study skills, research, and academic use cases.', 'https://anthropic.skilljar.com/ai-fluency-students', 'skilljar', 5, 180, 'course'),
(module_uuid('A06'), 'aware', 1, 'Challenge: Summarise a Real Document', 'Take a real document and use Claude to create a useful summary. Compare it to your own understanding.', NULL, 'internal', 6, 30, 'challenge'),
(module_uuid('A07'), 'aware', 1, 'Assessment: Frameworks Applied', 'Demonstrate your understanding of AI frameworks through practical scenarios.', NULL, 'internal', 7, 15, 'assessment'),
(module_uuid('A08'), 'aware', 1, 'Challenge: AI in Your Daily Life', 'Identify three tasks in your daily life where AI could help. Try at least one.', NULL, 'internal', 8, 45, 'challenge'),
(module_uuid('A09'), 'aware', 1, 'Tier Gate: Aware Completion', 'Final assessment for the Aware tier. Pass to unlock the Enabled tier.', NULL, 'internal', 9, 20, 'assessment');

-- ============================================================
-- ENABLED TIER (Track 2) — 9 modules
-- ============================================================

INSERT INTO modules (id, tier, track, title, description, external_url, platform, order_index, estimated_duration_mins, module_type) VALUES
(module_uuid('E01'), 'enabled', 2, 'Real-World AI for Everyone', 'Coursera specialisation covering practical AI applications across industries.', 'https://www.coursera.org/specializations/real-world-ai-for-everyone', 'coursera', 10, 600, 'course'),
(module_uuid('E02'), 'enabled', 2, 'Challenge: Custom Instruction Set', 'Create a custom instruction set for Claude tailored to your specific work or study needs.', NULL, 'internal', 11, 45, 'challenge'),
(module_uuid('E03'), 'enabled', 2, 'Assessment: Applied Prompting', 'Demonstrate your ability to craft effective prompts for real-world tasks.', NULL, 'internal', 12, 20, 'assessment'),
(module_uuid('E04'), 'enabled', 2, 'Prompt Engineering Interactive Tutorial', 'Hands-on prompt engineering from Anthropic — learn by doing.', 'https://github.com/anthropics/courses/tree/master/prompt_engineering_interactive_tutorial', 'github', 13, 180, 'course'),
(module_uuid('E05'), 'enabled', 2, 'Real World Prompting', 'Advanced prompting techniques for production-grade AI interactions.', 'https://github.com/anthropics/courses/tree/master/real_world_prompting', 'github', 14, 120, 'course'),
(module_uuid('E06'), 'enabled', 2, 'Challenge: Build a Prompt Library', 'Build a personal library of reusable prompts for your most common tasks.', NULL, 'internal', 15, 60, 'challenge'),
(module_uuid('E07'), 'enabled', 2, 'Assessment: Prompt Engineering Mastery', 'Prove your prompt engineering skills across multiple scenarios.', NULL, 'internal', 16, 25, 'assessment'),
(module_uuid('E08'), 'enabled', 2, 'Challenge: AI Workflow Integration', 'Integrate AI into an existing workflow — document before and after.', NULL, 'internal', 17, 60, 'challenge'),
(module_uuid('E09'), 'enabled', 2, 'Tier Gate: Enabled Completion', 'Final assessment for the Enabled tier. Pass to unlock the Specialist tier.', NULL, 'internal', 18, 25, 'assessment');

-- ============================================================
-- SPECIALIST TIER (Track 3) — 14 modules
-- ============================================================

INSERT INTO modules (id, tier, track, title, description, external_url, platform, order_index, estimated_duration_mins, module_type) VALUES
(module_uuid('S01'), 'specialist', 3, 'Building with the Claude API', 'Official Anthropic course on building applications with the Claude API.', 'https://anthropic.skilljar.com/building-with-the-claude-api', 'skilljar', 19, 480, 'course'),
(module_uuid('S02'), 'specialist', 3, 'API Fundamentals (GitHub)', 'Hands-on API fundamentals from the Anthropic courses repository.', 'https://github.com/anthropics/courses/tree/master/anthropic_api_fundamentals', 'github', 20, 120, 'course'),
(module_uuid('S03'), 'specialist', 3, 'Challenge: Build a Claude API Script', 'Build a working script that calls the Claude API to solve a real problem.', NULL, 'internal', 21, 90, 'challenge'),
(module_uuid('S04'), 'specialist', 3, 'Assessment: API Fundamentals', 'Demonstrate your Claude API knowledge through practical assessment.', NULL, 'internal', 22, 25, 'assessment'),
(module_uuid('S05'), 'specialist', 3, 'Claude Code in Action', 'Learn Claude Code — AI-powered development from inside your terminal.', 'https://anthropic.skilljar.com/claude-code-in-action', 'skilljar', 23, 240, 'course'),
(module_uuid('S06'), 'specialist', 3, 'Introduction to MCP', 'Model Context Protocol — connecting Claude to external tools and data.', 'https://anthropic.skilljar.com/introduction-to-mcp', 'skilljar', 24, 150, 'course'),
(module_uuid('S07'), 'specialist', 3, 'MCP Advanced Topics', 'Advanced MCP patterns — building servers, managing resources, security.', 'https://anthropic.skilljar.com/mcp-advanced-topics', 'skilljar', 25, 180, 'course'),
(module_uuid('S08'), 'specialist', 3, 'Tool Use (GitHub)', 'Hands-on tool use patterns from the Anthropic courses repository.', 'https://github.com/anthropics/courses/tree/master/tool_use', 'github', 26, 120, 'course'),
(module_uuid('S09'), 'specialist', 3, 'Challenge: Build an MCP Server', 'Build a working MCP server that connects Claude to an external data source.', NULL, 'internal', 27, 120, 'challenge'),
(module_uuid('S10'), 'specialist', 3, 'Introduction to Agent Skills', 'Building agent skills — extending Claude with specialised capabilities.', 'https://anthropic.skilljar.com/introduction-to-agent-skills', 'skilljar', 28, 30, 'course'),
(module_uuid('S11'), 'specialist', 3, 'Prompt Evaluations (GitHub)', 'Systematic prompt evaluation and testing from the Anthropic courses repository.', 'https://github.com/anthropics/courses/tree/master/prompt_evaluations', 'github', 29, 90, 'course'),
(module_uuid('S12'), 'specialist', 3, 'Building with the Claude API (Coursera)', 'Coursera specialisation — comprehensive Claude API development.', 'https://www.coursera.org/specializations/building-with-the-claude-api', 'coursera', 30, 600, 'course'),
(module_uuid('S13'), 'specialist', 3, 'CCA Exam Preparation', 'Preparation materials for the Claude Certified Architect examination.', 'https://claudecertifications.com/', 'claudecertifications', 31, 300, 'course'),
(module_uuid('S14'), 'specialist', 3, 'Assessment: Specialist Readiness', 'Final assessment — are you ready for CCA certification?', NULL, 'internal', 32, 30, 'assessment');

-- ============================================================
-- PREREQUISITES
-- ============================================================

-- Aware tier — linear chain except A06 which has OR logic
INSERT INTO prerequisites (module_id, prerequisite_module_id, prerequisite_group) VALUES
(module_uuid('A02'), module_uuid('A01'), 0),
(module_uuid('A03'), module_uuid('A02'), 0),
(module_uuid('A04'), module_uuid('A03'), 0),
(module_uuid('A05'), module_uuid('A03'), 0),
-- A06 requires A04 OR A05 (different groups = OR)
(module_uuid('A06'), module_uuid('A04'), 1),
(module_uuid('A06'), module_uuid('A05'), 2),
(module_uuid('A07'), module_uuid('A06'), 0),
(module_uuid('A08'), module_uuid('A07'), 0),
(module_uuid('A09'), module_uuid('A08'), 0);

-- Enabled tier — linear chain
INSERT INTO prerequisites (module_id, prerequisite_module_id, prerequisite_group) VALUES
(module_uuid('E01'), module_uuid('A09'), 0),
(module_uuid('E02'), module_uuid('E01'), 0),
(module_uuid('E03'), module_uuid('E02'), 0),
(module_uuid('E04'), module_uuid('E03'), 0),
(module_uuid('E05'), module_uuid('E04'), 0),
(module_uuid('E06'), module_uuid('E05'), 0),
(module_uuid('E07'), module_uuid('E06'), 0),
(module_uuid('E08'), module_uuid('E07'), 0),
(module_uuid('E09'), module_uuid('E08'), 0);

-- Specialist tier — linear except S09 which has AND logic
INSERT INTO prerequisites (module_id, prerequisite_module_id, prerequisite_group) VALUES
(module_uuid('S01'), module_uuid('E09'), 0),
(module_uuid('S02'), module_uuid('S01'), 0),
(module_uuid('S03'), module_uuid('S02'), 0),
(module_uuid('S04'), module_uuid('S03'), 0),
(module_uuid('S05'), module_uuid('S04'), 0),
(module_uuid('S06'), module_uuid('S05'), 0),
(module_uuid('S07'), module_uuid('S06'), 0),
(module_uuid('S08'), module_uuid('S06'), 0),
-- S09 requires S07 AND S08 (same group = AND)
(module_uuid('S09'), module_uuid('S07'), 0),
(module_uuid('S09'), module_uuid('S08'), 0),
(module_uuid('S10'), module_uuid('S09'), 0),
(module_uuid('S11'), module_uuid('S10'), 0),
(module_uuid('S12'), module_uuid('S11'), 0),
(module_uuid('S13'), module_uuid('S12'), 0),
(module_uuid('S14'), module_uuid('S13'), 0);

-- Clean up helper function (keep uuid-ossp extension)
DROP FUNCTION IF EXISTS module_uuid(TEXT);
