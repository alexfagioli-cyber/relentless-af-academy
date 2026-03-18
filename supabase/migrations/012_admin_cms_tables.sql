-- Phase 8B: Admin CMS tables

-- Prompt templates (move from hardcoded)
CREATE TABLE prompt_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  template TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authenticated can read prompts" ON prompt_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage prompts" ON prompt_templates FOR ALL USING (public.is_admin());

-- AI tools (move from hardcoded)
CREATE TABLE ai_tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  pricing TEXT CHECK (pricing IN ('free', 'freemium', 'paid')),
  alex_recommends BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authenticated can read tools" ON ai_tools FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage tools" ON ai_tools FOR ALL USING (public.is_admin());

-- Notification preferences
CREATE TABLE notification_preferences (
  learner_id UUID REFERENCES learner_profiles(id) ON DELETE CASCADE PRIMARY KEY,
  streak_reminders BOOLEAN DEFAULT TRUE,
  new_content_alerts BOOLEAN DEFAULT TRUE,
  community_activity BOOLEAN DEFAULT TRUE,
  share_completions BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own preferences" ON notification_preferences FOR ALL USING (learner_id = auth.uid());

-- Platform errors
CREATE TABLE platform_errors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  error_type TEXT NOT NULL,
  message TEXT,
  stack TEXT,
  page TEXT,
  learner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- No RLS on platform_errors — written by error boundary (may not have auth context)
-- Admin reads via service_role client

-- Video support on modules
ALTER TABLE modules ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS video_thumbnail TEXT;

-- Soft delete for news
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT FALSE;

-- Seed prompt templates
INSERT INTO prompt_templates (title, category, template, order_index) VALUES
('Explain like I''m 16', 'Study', 'Explain [topic] to me like I''m a smart 16-year-old. Use everyday language, real-world examples, and avoid jargon. If there are important technical terms, define them simply.', 1),
('Create practice questions', 'Study', 'I''m studying [subject/topic]. Create 10 practice questions that test understanding, not just memorisation. Include a mix of multiple choice, short answer, and one essay question. Provide answers at the end.', 2),
('Revision summary', 'Study', 'Summarise the key concepts of [topic/chapter] in a revision-friendly format. Use bullet points, bold the most important terms, and include a "common exam mistakes" section at the end.', 3),
('Compare and contrast', 'Study', 'Compare [concept A] and [concept B]. Create a clear table showing similarities and differences, then explain when you''d use each one in practice.', 4),
('Meeting prep brief', 'Work', 'I have a meeting about [topic] with [who]. My goals are [goals]. Prepare a brief: key talking points, potential questions they''ll ask, and 3 outcomes I should push for.', 5),
('Email draft', 'Work', 'Draft an email to [recipient] about [topic]. Tone: [professional/friendly/direct]. Key points to cover: [points]. Keep it under 200 words.', 6),
('Summarise this document', 'Work', 'Summarise this document in 3 sections: (1) Key decisions or findings (2) Action items (3) Things to watch. Be direct — no filler.\n\n[paste document]', 7),
('Weekly update', 'Work', 'Help me write a weekly update. This week I: [list what you did]. Next week I''m focused on: [priorities]. Blockers: [any issues]. Format it as a concise 3-section update.', 8),
('Brainstorm ideas', 'Creative', 'I need ideas for [project/topic]. Give me 10 creative options — half should be safe and practical, half should be bold and unexpected. For each, one sentence on why it could work.', 9),
('Story starter', 'Creative', 'Write the opening 200 words of a short story set in [setting]. The main character is [description]. The tone should be [tone]. End on a hook that makes the reader want to continue.', 10),
('Social media post', 'Creative', 'Write a [platform] post about [topic]. Tone: [casual/professional/inspiring]. Include a hook in the first line. Under [word count] words. Suggest 3 hashtags.', 11),
('Deep dive briefing', 'Research', 'Give me a comprehensive briefing on [topic]. Structure: (1) What it is (2) Why it matters (3) Current state (4) Key players (5) What to watch. Write for someone intelligent but new to the topic.', 12),
('Pros and cons analysis', 'Research', 'Analyse the pros and cons of [decision/option]. Be balanced — don''t lean one way. Include a "bottom line" recommendation at the end with your reasoning.', 13),
('Find the counterargument', 'Research', 'I believe [your position]. Steelman the strongest counterargument. Then tell me which points I should take seriously and which I can dismiss.', 14),
('Simplify this paper', 'Research', 'Simplify this academic paper/article for a non-specialist. What''s the main finding? Why does it matter? What are the limitations?\n\n[paste text]', 15),
('Decision framework', 'Decision-Making', 'Help me decide between [option A] and [option B]. My priorities are [list priorities]. Score each option against my priorities and give a clear recommendation.', 16),
('Pre-mortem', 'Decision-Making', 'I''m about to [decision/action]. Imagine it''s 6 months from now and it went badly wrong. What went wrong? What should I watch out for? What would I wish I''d done differently?', 17),
('Second opinion', 'Decision-Making', 'Here''s my plan: [describe plan]. Be my advisor. What am I missing? What are the risks I''m not seeing? Be direct — I want the truth, not reassurance.', 18),
('Improve my writing', 'Writing', 'Improve this text. Keep my voice and meaning but make it clearer, more concise, and more impactful. Show me the changes and explain why you made them.\n\n[paste text]', 19),
('Change the tone', 'Writing', 'Rewrite this in a [formal/casual/persuasive/empathetic] tone. Keep the core message but change how it lands.\n\n[paste text]', 20);

-- Seed AI tools
INSERT INTO ai_tools (name, description, url, category, pricing, alex_recommends, order_index) VALUES
('Claude', 'Anthropic''s AI assistant — the one you''re learning to master here.', 'https://claude.ai', 'AI Assistants', 'freemium', true, 1),
('ChatGPT', 'OpenAI''s conversational AI. Good for comparison and different perspectives.', 'https://chat.openai.com', 'AI Assistants', 'freemium', false, 2),
('Grammarly', 'AI-powered writing assistant for grammar, clarity, and tone.', 'https://www.grammarly.com', 'Writing', 'freemium', false, 3),
('Hemingway', 'Makes your writing bold and clear. Highlights complex sentences.', 'https://hemingwayapp.com', 'Writing', 'free', false, 4),
('DALL-E', 'OpenAI''s image generator. Create images from text descriptions.', 'https://openai.com/dall-e-3', 'Image', 'paid', false, 5),
('Midjourney', 'High-quality AI art generation. Best for creative and artistic work.', 'https://www.midjourney.com', 'Image', 'paid', false, 6),
('Runway', 'AI video generation and editing. Text-to-video, image-to-video.', 'https://runwayml.com', 'Video', 'freemium', false, 7),
('HeyGen', 'AI video avatars for presentations, training, and marketing.', 'https://www.heygen.com', 'Video', 'freemium', false, 8),
('GitHub Copilot', 'AI pair programmer that suggests code in your editor.', 'https://github.com/features/copilot', 'Code', 'paid', false, 9),
('Cursor', 'AI-first code editor. Built for working with AI from the ground up.', 'https://cursor.sh', 'Code', 'freemium', true, 10),
('Claude Code', 'Anthropic''s terminal-based AI coding assistant. Specialist-tier material.', 'https://docs.anthropic.com/en/docs/claude-code', 'Code', 'paid', true, 11),
('Granola', 'AI meeting notes that actually work. Records and summarises automatically.', 'https://www.granola.ai', 'Productivity', 'freemium', true, 12),
('Wispr Flow', 'AI-powered voice dictation. Speak naturally, get clean text.', 'https://www.wispr.ai', 'Productivity', 'paid', true, 13),
('Notion AI', 'AI built into Notion — summarise, draft, brainstorm within your workspace.', 'https://www.notion.so/product/ai', 'Productivity', 'paid', false, 14),
('Perplexity', 'AI-powered search engine. Get answers with sources, not just links.', 'https://www.perplexity.ai', 'Research', 'freemium', true, 15),
('Consensus', 'AI search engine for academic research. Find evidence-based answers.', 'https://consensus.app', 'Research', 'freemium', false, 16);
