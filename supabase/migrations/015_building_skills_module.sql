-- Building Skills for Claude — new Specialist internal course + assessment
-- Source: Anthropic's "The Complete Guide to Building Skills for Claude" (29-page PDF)
-- Top 20 concepts distilled into interactive screens + 20-question assessment

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE OR REPLACE FUNCTION module_uuid(short_id TEXT)
RETURNS UUID AS $$
  SELECT uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'relentlessaf-' || short_id);
$$ LANGUAGE sql IMMUTABLE;

-- ============================================================
-- Module: Building Skills for Claude (interactive course)
-- Slot after S10 (Introduction to Agent Skills), before S11
-- ============================================================
INSERT INTO modules (id, tier, track, title, description, external_url, platform, order_index, estimated_duration_mins, module_type, content) VALUES
(module_uuid('S10b'), 'specialist', 3, 'Building Skills for Claude', 'Learn to build skills — reusable instruction packages that teach Claude workflows, best practices, and domain expertise. Covers the complete lifecycle from planning to testing to distribution.', NULL, 'internal', 34, 45, 'course',
'{
  "screens": [
    {
      "title": "What is a Skill?",
      "body": "A **skill** is a folder containing instructions that teaches Claude how to handle specific tasks or workflows.\n\nInstead of re-explaining your preferences, processes, and domain expertise in every conversation, you teach Claude once and it applies that knowledge every time.\n\nThe only required file is **SKILL.md** — a Markdown file with YAML frontmatter. Optionally you can include:\n\n• **scripts/** — executable code (Python, Bash, etc.)\n• **references/** — documentation loaded as needed\n• **assets/** — templates, fonts, icons used in output\n\nThink of it this way: if you find yourself giving Claude the same instructions repeatedly, that should be a skill."
    },
    {
      "title": "Progressive Disclosure",
      "body": "Skills use a **three-level system** that minimises token usage while maintaining expertise:\n\n**Level 1 — YAML frontmatter.** Always loaded into Claude''s system prompt. Gives just enough information for Claude to know WHEN the skill should be used. This is the skill''s \"shopfront\".\n\n**Level 2 — SKILL.md body.** Loaded when Claude decides the skill is relevant to the current task. Contains the full instructions and guidance.\n\n**Level 3 — Linked files.** Additional files in the skill folder that Claude can discover and navigate to as needed — API guides, examples, templates.\n\nThis matters because loading everything into context all the time wastes tokens and degrades performance. The best skills are lean at Level 1 and rich at Levels 2 and 3.",
      "inputs": [
        {
          "key": "disclosure_understanding",
          "type": "radio",
          "label": "Why does progressive disclosure matter?",
          "options": [
            "It makes the skill folder smaller on disk",
            "It minimises token usage while maintaining specialised expertise",
            "It makes the skill load faster",
            "It prevents other skills from loading"
          ]
        }
      ]
    },
    {
      "title": "The Kitchen Analogy",
      "body": "If you''re already building with MCP, here''s how skills fit in:\n\n**MCP provides the professional kitchen** — access to tools, ingredients, and equipment. It connects Claude to your services (Notion, Linear, Slack, etc.) and provides real-time data access and tool invocation.\n\n**Skills provide the recipes** — step-by-step instructions on how to create something valuable using those tools.\n\nWithout skills, users connect your MCP but don''t know what to do next. Each conversation starts from scratch. Results are inconsistent because everyone prompts differently.\n\nWith skills, pre-built workflows activate automatically. Best practices are embedded in every interaction. The learning curve drops dramatically.\n\nEven without MCP, standalone skills are powerful — they work with Claude''s built-in capabilities like code execution, document creation, and analysis."
    },
    {
      "title": "Two Key Properties",
      "body": "Every well-built skill has these properties:\n\n**Composability.** Claude can load multiple skills simultaneously. Your skill should work well alongside others — don''t assume it''s the only capability available. A good skill does one thing well and doesn''t try to control everything.\n\n**Portability.** Skills work identically across Claude.ai, Claude Code, and the API. Build a skill once and it works on all surfaces without modification, provided the environment supports any dependencies your skill requires.\n\nThese two properties are what make skills genuinely powerful. A composable, portable skill is a reusable building block that compounds in value over time.",
      "inputs": [
        {
          "key": "composability_example",
          "type": "textarea",
          "label": "Give an example of two skills that might work well together.",
          "placeholder": "e.g. A data-analysis skill + a report-generation skill..."
        }
      ]
    },
    {
      "title": "Planning: Start with Use Cases",
      "body": "Before writing any code, identify **2-3 concrete use cases** your skill should enable.\n\nA good use case definition looks like this:\n\nUse Case: Project Sprint Planning\nTrigger: User says \"help me plan this sprint\"\nSteps: 1. Fetch project status  2. Analyse capacity  3. Suggest priorities  4. Create tasks\nResult: Fully planned sprint with tasks created\n\n**Ask yourself:**\n• What does a user want to accomplish?\n• What multi-step workflows does this require?\n• Which tools are needed (built-in or MCP)?\n• What domain knowledge or best practices should be embedded?\n\nAnthropic has observed three common skill categories:\n\n**1. Document & Asset Creation** — generating consistent, high-quality output (reports, designs, code)\n**2. Workflow Automation** — multi-step processes with validation gates and templates\n**3. MCP Enhancement** — adding workflow guidance on top of MCP tool access"
    },
    {
      "title": "Success Criteria",
      "body": "Before building, define how you''ll know your skill is working. Anthropic recommends both quantitative and qualitative metrics.\n\n**Quantitative:**\n• Skill triggers on 90% of relevant queries — test with 10-20 phrases\n• Completes workflow in X tool calls — compare with and without the skill\n• 0 failed API calls per workflow — monitor during testing\n\n**Qualitative:**\n• Users don''t need to prompt Claude about next steps\n• Workflows complete without user correction\n• Consistent results across sessions — run the same request 3-5 times\n• A new user can accomplish the task on first try with minimal guidance\n\nThese are rough benchmarks, not precise thresholds. The goal is to have clear criteria BEFORE you start building so you know when you''re done.",
      "inputs": [
        {
          "key": "success_metric",
          "type": "radio",
          "label": "Which is a qualitative success metric?",
          "options": [
            "Skill triggers on 90% of relevant queries",
            "0 failed API calls per workflow",
            "Workflows complete without user correction",
            "Completes in under 6000 tokens"
          ]
        }
      ]
    },
    {
      "title": "The YAML Frontmatter",
      "body": "The YAML frontmatter is **the most important part of your skill**. It''s how Claude decides whether to load your skill. Get this wrong and your skill never activates.\n\n**Critical rules:**\n• File must be exactly **SKILL.md** (case-sensitive — not SKILL.MD or skill.md)\n• Folder name uses **kebab-case** (my-cool-skill, not My Cool Skill or my_cool_skill)\n• **No README.md** inside the skill folder — all docs go in SKILL.md or references/\n\n**Required fields:**\n\n**name** — kebab-case, no spaces or capitals, should match folder name\n\n**description** — the field that makes or breaks your skill. Must include BOTH:\n  — What the skill does\n  — When to use it (trigger conditions)\n  — Under 1024 characters, no XML angle brackets\n\n**The description formula:**\n[What it does] + [When to use it] + [Key capabilities]"
    },
    {
      "title": "Good vs Bad Descriptions",
      "body": "The description field is where most skills succeed or fail. Here are real examples:\n\n**Good — specific and actionable:**\n\"Analyses Figma design files and generates developer handoff documentation. Use when user uploads .fig files, asks for design specs, component documentation, or design-to-code handoff.\"\n\n**Good — includes trigger phrases:**\n\"Manages Linear project workflows including sprint planning, task creation, and status tracking. Use when user mentions sprint, Linear tasks, project planning, or asks to create tickets.\"\n\n**Bad — too vague:**\n\"Helps with projects.\"\n\n**Bad — missing triggers:**\n\"Creates sophisticated multi-page documentation systems.\"\n\n**Bad — too technical, no user triggers:**\n\"Implements the Project entity model with hierarchical relationships.\"\n\nThe test: would a user actually say something that matches your description? If not, Claude won''t know when to load your skill.",
      "inputs": [
        {
          "key": "write_description",
          "type": "textarea",
          "label": "Write a skill description for a tool that helps create meeting agendas. Include what it does AND trigger phrases.",
          "placeholder": "description: ..."
        }
      ]
    },
    {
      "title": "Writing Instructions That Work",
      "body": "After the frontmatter, the SKILL.md body contains your actual instructions in Markdown.\n\n**Be specific and actionable:**\nGood: \"Run python scripts/validate.py --input {filename} to check data format. If validation fails, common issues include: missing required fields, invalid date formats (use YYYY-MM-DD).\"\nBad: \"Validate the data before proceeding.\"\n\n**Include error handling:**\nAlways add a Common Issues section. When something goes wrong, Claude needs to know what to try.\n\n**Reference bundled resources clearly:**\n\"Before writing queries, consult references/api-patterns.md for rate limiting guidance, pagination patterns, and error codes.\"\n\n**Use progressive disclosure in your instructions too:**\nKeep SKILL.md focused on core instructions. Move detailed documentation to references/ and link to it. Keep SKILL.md under 5000 words.\n\n**Put critical instructions at the top.** Use ## Important or ## Critical headers. Repeat key points if needed — Claude pays more attention to content early in the file."
    },
    {
      "title": "Testing Your Skill",
      "body": "Effective skill testing covers three areas:\n\n**1. Triggering tests** — Does your skill load at the right times?\n• Should trigger on obvious tasks (\"Help me set up a new project\")\n• Should trigger on paraphrased requests (\"I need to create a project\")\n• Should NOT trigger on unrelated topics (\"What''s the weather?\")\n\n**2. Functional tests** — Does it produce correct outputs?\n• Valid outputs generated\n• API calls succeed\n• Error handling works\n• Edge cases covered\n\n**3. Performance comparison** — Is it actually better than no skill?\nCompare the same task with and without the skill enabled. Count: messages needed, tool calls, failed attempts, tokens consumed.\n\n**Pro tip from Anthropic:** Iterate on a single task before expanding. Get one challenging workflow working, extract the winning approach into a skill, then broaden to multiple use cases. This gives you faster signal than broad testing.",
      "inputs": [
        {
          "key": "testing_approach",
          "type": "radio",
          "label": "What should you test FIRST when building a new skill?",
          "options": [
            "Test it on 50 different use cases at once",
            "Iterate on a single challenging task until it succeeds",
            "Deploy it to your whole team and collect feedback",
            "Run automated performance benchmarks"
          ]
        }
      ]
    },
    {
      "title": "Iteration Signals",
      "body": "Skills are living documents. After initial deployment, watch for these signals:\n\n**Undertriggering** — your skill doesn''t load when it should:\n• Users manually enabling the skill\n• Support questions about when to use it\n• Skill doesn''t activate on relevant queries\nFix: Add more detail and keyword triggers to the description.\n\n**Overtriggering** — your skill loads when it shouldn''t:\n• Skill activates for irrelevant queries\n• Users disabling the skill\n• Confusion about the skill''s purpose\nFix: Add negative triggers (\"Do NOT use for...\"), be more specific about scope.\n\n**Instructions not followed** — skill loads but Claude ignores parts:\n• Instructions too verbose — use bullet points, not prose\n• Critical instructions buried — put them at the top\n• Ambiguous language — \"Make sure to validate\" vs \"CRITICAL: Before calling create_project, verify: project name is non-empty, at least one team member assigned, start date is not in the past\"\n\n**Model laziness** — Claude skips validation steps:\nAdd explicit encouragement: \"Take your time. Quality is more important than speed. Do not skip validation steps.\""
    },
    {
      "title": "Five Workflow Patterns",
      "body": "These patterns emerged from early adopters and Anthropic''s internal teams:\n\n**Pattern 1: Sequential Orchestration** — Multi-step processes in a specific order with dependencies between steps and validation at each stage.\n\n**Pattern 2: Multi-MCP Coordination** — Workflows spanning multiple services (e.g., export from Figma, store in Drive, create tasks in Linear, notify in Slack). Clear phase separation and data passing between MCPs.\n\n**Pattern 3: Iterative Refinement** — Output improves with iteration. Generate draft, run quality check, address issues, regenerate, repeat until threshold met.\n\n**Pattern 4: Context-Aware Tool Selection** — Same outcome, different tools depending on context. Decision criteria drive which approach to use (e.g., large files to cloud storage, code to GitHub, docs to Notion).\n\n**Pattern 5: Domain-Specific Intelligence** — Your skill adds specialised knowledge beyond tool access. Compliance rules, industry standards, best practices embedded in the workflow logic.",
      "inputs": [
        {
          "key": "pattern_match",
          "type": "radio",
          "label": "You want to build a skill that generates reports, checks quality, and refines until they pass. Which pattern?",
          "options": [
            "Sequential Orchestration",
            "Multi-MCP Coordination",
            "Iterative Refinement",
            "Domain-Specific Intelligence"
          ]
        }
      ]
    },
    {
      "title": "Problem-First vs Tool-First",
      "body": "When designing your skill, choose your approach:\n\n**Problem-first:** \"I need to set up a project workspace.\" Your skill orchestrates the right MCP calls in the right sequence. Users describe outcomes — the skill handles the tools.\n\n**Tool-first:** \"I have Notion MCP connected.\" Your skill teaches Claude the optimal workflows and best practices for that tool. Users already have access — the skill provides expertise.\n\nMost skills lean one direction. The distinction matters because it determines how you write your instructions:\n\n• Problem-first skills need clear step ordering, dependencies, and rollback instructions\n• Tool-first skills need embedded best practices, common patterns, and domain knowledge\n\nKnowing which framing fits your use case helps you choose the right workflow pattern from the previous screen."
    },
    {
      "title": "Distribution and the skill-creator",
      "body": "**How to distribute skills:**\n1. Download the skill folder\n2. Zip it (if needed)\n3. Upload via Claude.ai → Settings → Capabilities → Skills\n4. Or place in your Claude Code skills directory\n\nOrganisations can deploy skills workspace-wide with automatic updates and centralised management.\n\n**The skill-creator tool** is built into Claude.ai and Claude Code. It can:\n• Generate skills from natural language descriptions\n• Produce properly formatted SKILL.md with frontmatter\n• Suggest trigger phrases and structure\n• Review and flag common issues (vague descriptions, structural problems)\n\nTo use it: \"Use the skill-creator skill to help me build a skill for [your use case].\"\n\nSkills are an **open standard** (like MCP) — designed to be portable across platforms, not locked to Claude.\n\n**Position your skill around outcomes, not features:**\nGood: \"Enables teams to set up project workspaces in seconds — including pages, databases, and templates.\"\nBad: \"A folder containing YAML frontmatter and Markdown instructions that calls our MCP server tools.\""
    },
    {
      "title": "Now Plan Your First Skill",
      "body": "You have the knowledge. Time to plan a real skill.\n\nThink about a workflow you repeat often — something where you give Claude the same context and instructions regularly. That''s your skill candidate.",
      "inputs": [
        {
          "key": "skill_use_case",
          "type": "textarea",
          "label": "What workflow will your skill automate? (Use case, trigger, steps, result)",
          "placeholder": "Use Case: ...\nTrigger: User says ...\nSteps: 1. ... 2. ... 3. ...\nResult: ..."
        },
        {
          "key": "skill_category",
          "type": "radio",
          "label": "Which category does your skill fit?",
          "options": [
            "Document & Asset Creation",
            "Workflow Automation",
            "MCP Enhancement"
          ]
        },
        {
          "key": "skill_description",
          "type": "textarea",
          "label": "Write the description field for your skill (what it does + when to use it + key capabilities).",
          "placeholder": "description: ..."
        }
      ]
    }
  ]
}'::jsonb);

-- ============================================================
-- Assessment: Building Skills (20 questions, 75%, 25 mins)
-- ============================================================
INSERT INTO modules (id, tier, track, title, description, external_url, platform, order_index, estimated_duration_mins, module_type) VALUES
(module_uuid('S10c'), 'specialist', 3, 'Assessment: Building Skills', 'Test your knowledge of skill architecture, design patterns, testing, and distribution.', NULL, 'internal', 35, 25, 'assessment');

INSERT INTO assessments (id, module_id, title, pass_score, time_limit_mins, questions) VALUES (
  gen_random_uuid(),
  module_uuid('S10c'),
  'Assessment: Building Skills for Claude',
  75,
  25,
  '{
    "title": "Building Skills for Claude",
    "showProgressBar": "bottom",
    "elements": [
      {
        "type": "radiogroup",
        "name": "q1_what_is_skill",
        "title": "What is a Claude skill?",
        "choices": [
          "A plugin that extends Claude'\''s language model",
          "A folder containing instructions that teaches Claude how to handle specific tasks or workflows",
          "A Python script that runs alongside Claude",
          "A fine-tuned version of Claude for a specific domain"
        ],
        "correctAnswer": "A folder containing instructions that teaches Claude how to handle specific tasks or workflows"
      },
      {
        "type": "radiogroup",
        "name": "q2_required_file",
        "title": "What is the only required file in a skill folder?",
        "choices": [
          "README.md",
          "config.yaml",
          "SKILL.md",
          "index.js"
        ],
        "correctAnswer": "SKILL.md"
      },
      {
        "type": "radiogroup",
        "name": "q3_progressive_disclosure",
        "title": "In the progressive disclosure system, what is Level 1?",
        "choices": [
          "The full SKILL.md body with all instructions",
          "The YAML frontmatter — always loaded to help Claude decide when to use the skill",
          "Linked reference files that Claude navigates to as needed",
          "The scripts/ directory with executable code"
        ],
        "correctAnswer": "The YAML frontmatter — always loaded to help Claude decide when to use the skill"
      },
      {
        "type": "radiogroup",
        "name": "q4_kitchen_analogy",
        "title": "In the kitchen analogy, what do skills provide?",
        "choices": [
          "The kitchen equipment and tools",
          "The ingredients and raw materials",
          "The recipes — step-by-step instructions on how to create something valuable",
          "The restaurant menu for customers"
        ],
        "correctAnswer": "The recipes — step-by-step instructions on how to create something valuable"
      },
      {
        "type": "radiogroup",
        "name": "q5_composability",
        "title": "What does it mean for a skill to be composable?",
        "choices": [
          "It can be written in multiple programming languages",
          "It works alongside other skills simultaneously without conflict",
          "It can be broken into smaller skills",
          "It composes its own documentation automatically"
        ],
        "correctAnswer": "It works alongside other skills simultaneously without conflict"
      },
      {
        "type": "radiogroup",
        "name": "q6_portability",
        "title": "Where do portable skills work?",
        "choices": [
          "Only in Claude.ai",
          "Only in Claude Code",
          "Across Claude.ai, Claude Code, and the API",
          "Only on desktop platforms"
        ],
        "correctAnswer": "Across Claude.ai, Claude Code, and the API"
      },
      {
        "type": "radiogroup",
        "name": "q7_first_step",
        "title": "What should you do BEFORE writing any skill code?",
        "choices": [
          "Set up the folder structure with all optional directories",
          "Identify 2-3 concrete use cases the skill should enable",
          "Write the YAML frontmatter",
          "Deploy a test version to Claude.ai"
        ],
        "correctAnswer": "Identify 2-3 concrete use cases the skill should enable"
      },
      {
        "type": "radiogroup",
        "name": "q8_skill_categories",
        "title": "Which is NOT one of the three common skill categories observed by Anthropic?",
        "choices": [
          "Document & Asset Creation",
          "Workflow Automation",
          "Model Fine-Tuning",
          "MCP Enhancement"
        ],
        "correctAnswer": "Model Fine-Tuning"
      },
      {
        "type": "radiogroup",
        "name": "q9_naming_rules",
        "title": "Which skill folder name is correct?",
        "choices": [
          "My Cool Skill",
          "my_cool_skill",
          "my-cool-skill",
          "MyCoolSkill"
        ],
        "correctAnswer": "my-cool-skill"
      },
      {
        "type": "radiogroup",
        "name": "q10_description_must_include",
        "title": "A skill description MUST include which two things?",
        "choices": [
          "Author name and version number",
          "What the skill does AND when to use it (trigger conditions)",
          "The programming language and dependencies",
          "A changelog and license"
        ],
        "correctAnswer": "What the skill does AND when to use it (trigger conditions)"
      },
      {
        "type": "radiogroup",
        "name": "q11_bad_description",
        "title": "Which skill description would perform WORST?",
        "choices": [
          "Manages Linear project workflows including sprint planning and task creation. Use when user mentions sprint or asks to create tickets.",
          "Analyses Figma design files and generates developer handoff documentation. Use when user uploads .fig files.",
          "Helps with projects.",
          "End-to-end customer onboarding workflow for PayFlow. Handles account creation, payment setup, and subscription management."
        ],
        "correctAnswer": "Helps with projects."
      },
      {
        "type": "radiogroup",
        "name": "q12_instructions_best_practice",
        "title": "Where should critical instructions be placed in SKILL.md?",
        "choices": [
          "At the bottom, as a summary",
          "At the top, using ## Important or ## Critical headers",
          "In a separate config file",
          "In the YAML frontmatter description field"
        ],
        "correctAnswer": "At the top, using ## Important or ## Critical headers"
      },
      {
        "type": "radiogroup",
        "name": "q13_skill_md_size",
        "title": "What is the recommended maximum size for SKILL.md?",
        "choices": [
          "500 words",
          "1000 words",
          "5000 words — move detailed docs to references/",
          "No limit — put everything in one file"
        ],
        "correctAnswer": "5000 words — move detailed docs to references/"
      },
      {
        "type": "radiogroup",
        "name": "q14_testing_first",
        "title": "According to Anthropic, what is the most effective testing approach?",
        "choices": [
          "Test across 50 use cases simultaneously",
          "Iterate on a single challenging task until it succeeds, then expand",
          "Deploy to production and monitor logs",
          "Only test the YAML frontmatter triggers"
        ],
        "correctAnswer": "Iterate on a single challenging task until it succeeds, then expand"
      },
      {
        "type": "radiogroup",
        "name": "q15_undertriggering",
        "title": "Your skill does not load when it should. Users keep manually enabling it. What is the fix?",
        "choices": [
          "Add more reference files",
          "Rewrite the SKILL.md body instructions",
          "Add more detail and keyword triggers to the description field",
          "Move the skill to a different folder"
        ],
        "correctAnswer": "Add more detail and keyword triggers to the description field"
      },
      {
        "type": "radiogroup",
        "name": "q16_overtriggering",
        "title": "Your skill loads for irrelevant queries. What is the fix?",
        "choices": [
          "Make the description longer",
          "Add negative triggers and be more specific about scope",
          "Remove the description field",
          "Add more use cases to the skill"
        ],
        "correctAnswer": "Add negative triggers and be more specific about scope"
      },
      {
        "type": "radiogroup",
        "name": "q17_iterative_refinement_pattern",
        "title": "Which workflow pattern generates a draft, checks quality, fixes issues, and repeats until a threshold is met?",
        "choices": [
          "Sequential Orchestration",
          "Multi-MCP Coordination",
          "Iterative Refinement",
          "Context-Aware Tool Selection"
        ],
        "correctAnswer": "Iterative Refinement"
      },
      {
        "type": "radiogroup",
        "name": "q18_problem_vs_tool",
        "title": "In a problem-first skill, what do users describe?",
        "choices": [
          "Which MCP tools they want to use",
          "The outcome they want — the skill handles the tools",
          "The technical architecture of the solution",
          "The specific API calls needed"
        ],
        "correctAnswer": "The outcome they want — the skill handles the tools"
      },
      {
        "type": "radiogroup",
        "name": "q19_skill_creator",
        "title": "What can the built-in skill-creator tool do?",
        "choices": [
          "Automatically deploy skills to production",
          "Generate skills from descriptions, produce formatted SKILL.md, and suggest triggers",
          "Train a custom AI model for your skill",
          "Run automated test suites and produce evaluation results"
        ],
        "correctAnswer": "Generate skills from descriptions, produce formatted SKILL.md, and suggest triggers"
      },
      {
        "type": "radiogroup",
        "name": "q20_positioning",
        "title": "When describing your skill to users, what should you focus on?",
        "choices": [
          "The technical implementation details",
          "The file structure and YAML format",
          "Outcomes — what users can accomplish, not how the skill works internally",
          "The number of MCP tools it uses"
        ],
        "correctAnswer": "Outcomes — what users can accomplish, not how the skill works internally"
      }
    ]
  }'::jsonb
);

-- ============================================================
-- Prerequisites
-- ============================================================

-- Bump S11-S14 order_index to make room
UPDATE modules SET order_index = 36 WHERE id = module_uuid('S11');
UPDATE modules SET order_index = 37 WHERE id = module_uuid('S12');
UPDATE modules SET order_index = 38 WHERE id = module_uuid('S13');
UPDATE modules SET order_index = 39 WHERE id = module_uuid('S14');

-- S10b requires S10 (Introduction to Agent Skills)
INSERT INTO prerequisites (module_id, prerequisite_module_id, prerequisite_group) VALUES
(module_uuid('S10b'), module_uuid('S10'), 0);

-- S10c (assessment) requires S10b (course)
INSERT INTO prerequisites (module_id, prerequisite_module_id, prerequisite_group) VALUES
(module_uuid('S10c'), module_uuid('S10b'), 0);

-- S11 now requires S10c instead of S10
DELETE FROM prerequisites WHERE module_id = module_uuid('S11') AND prerequisite_module_id = module_uuid('S10');
INSERT INTO prerequisites (module_id, prerequisite_module_id, prerequisite_group) VALUES
(module_uuid('S11'), module_uuid('S10c'), 0);

-- Clean up
DROP FUNCTION IF EXISTS module_uuid(TEXT);
