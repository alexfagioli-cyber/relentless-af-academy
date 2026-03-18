-- Phase 7: News items table for AI News & Ideas page

CREATE TABLE news_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'news',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read news
CREATE POLICY "Authenticated users can read news" ON news_items FOR SELECT
  USING (auth.role() = 'authenticated');

-- Admins can manage news
CREATE POLICY "Admins can manage news" ON news_items FOR ALL
  USING (EXISTS (SELECT 1 FROM learner_profiles WHERE id = auth.uid() AND is_admin = true));

-- Seed 10 items
INSERT INTO news_items (title, description, url, category, published_at) VALUES
('Claude can now use tools and take actions',
 'Claude can connect to external tools, search the web, and execute multi-step tasks. This changes what''s possible with AI.',
 'https://www.anthropic.com/news/tool-use-ga',
 'feature', NOW() - INTERVAL '30 days'),

('How to write prompts that actually work',
 'Anthropic''s official guide to prompt engineering — the same techniques used by professionals building with Claude.',
 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview',
 'tip', NOW() - INTERVAL '25 days'),

('Model Context Protocol (MCP) explained',
 'MCP lets Claude connect to your files, databases, and tools. It''s the bridge between AI and your real data.',
 'https://www.anthropic.com/news/model-context-protocol',
 'feature', NOW() - INTERVAL '20 days'),

('Students are using AI to study smarter',
 'From breaking down complex topics to generating practice questions — AI is transforming how students learn. Here''s how to start.',
 'https://www.anthropic.com/news/claude-for-education',
 'use-case', NOW() - INTERVAL '18 days'),

('Claude Code: AI-powered development',
 'Write, debug, and refactor code with Claude directly in your terminal. Specialist-tier material that''s changing how software gets built.',
 'https://www.anthropic.com/news/claude-code',
 'feature', NOW() - INTERVAL '15 days'),

('5 things you can do with Claude right now',
 'Draft emails, summarise documents, brainstorm ideas, analyse data, and get a second opinion on decisions. Start with one.',
 'https://claude.ai',
 'tip', NOW() - INTERVAL '12 days'),

('The Claude Certified Architect programme',
 'Professional certification that proves your AI skills. The Specialist tier prepares you for this — it''s the endgame.',
 'https://claudecertifications.com',
 'news', NOW() - INTERVAL '10 days'),

('AI is reshaping every industry',
 'From healthcare to finance to education — AI adoption is accelerating. The question isn''t whether to learn it, but how fast.',
 'https://www.anthropic.com/research',
 'news', NOW() - INTERVAL '8 days'),

('How professionals are using AI daily',
 'Automate reports, draft communications, analyse trends, prepare for meetings. AI isn''t replacing professionals — it''s amplifying the good ones.',
 'https://www.anthropic.com/customers',
 'use-case', NOW() - INTERVAL '5 days'),

('Build your own AI tools — no code required',
 'With Claude''s Projects feature, you can create custom AI tools tailored to your specific needs. Upload context, set instructions, and go.',
 'https://www.anthropic.com/news/projects',
 'tip', NOW() - INTERVAL '2 days');
