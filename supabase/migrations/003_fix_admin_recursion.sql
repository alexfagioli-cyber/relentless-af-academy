-- Fix infinite recursion in RLS policies.
-- Admin-check policies on learner_profiles reference learner_profiles itself.
-- Solution: SECURITY DEFINER function that bypasses RLS for the is_admin lookup.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.learner_profiles WHERE id = auth.uid()),
    false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Drop the recursive policies on learner_profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON learner_profiles;

-- Recreate using the function
CREATE POLICY "Admins can read all profiles"
  ON learner_profiles FOR SELECT
  USING (public.is_admin());

-- Update all other admin policies to use the function
DROP POLICY IF EXISTS "Admins can read all invites" ON invites;
CREATE POLICY "Admins can read all invites"
  ON invites FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can create invites" ON invites;
CREATE POLICY "Admins can create invites"
  ON invites FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update invites" ON invites;
CREATE POLICY "Admins can update invites"
  ON invites FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read all onboarding" ON onboarding_responses;
CREATE POLICY "Admins can read all onboarding"
  ON onboarding_responses FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage modules" ON modules;
CREATE POLICY "Admins can manage modules"
  ON modules FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage prerequisites" ON prerequisites;
CREATE POLICY "Admins can manage prerequisites"
  ON prerequisites FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage assessments" ON assessments;
CREATE POLICY "Admins can manage assessments"
  ON assessments FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read all progress" ON progress;
CREATE POLICY "Admins can read all progress"
  ON progress FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read all attempts" ON assessment_attempts;
CREATE POLICY "Admins can read all attempts"
  ON assessment_attempts FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read all signals" ON learning_signals;
CREATE POLICY "Admins can read all signals"
  ON learning_signals FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read all events" ON learning_events;
CREATE POLICY "Admins can read all events"
  ON learning_events FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read all nudges" ON nudges;
CREATE POLICY "Admins can read all nudges"
  ON nudges FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert nudges" ON nudges;
CREATE POLICY "Admins can insert nudges"
  ON nudges FOR INSERT
  WITH CHECK (public.is_admin());
