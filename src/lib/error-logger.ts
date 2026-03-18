import { createClient } from '@supabase/supabase-js'

export async function logPlatformError({
  errorType,
  message,
  stack,
  page,
  learnerId,
}: {
  errorType: string
  message?: string
  stack?: string
  page?: string
  learnerId?: string
}) {
  try {
    // Use anon client — platform_errors has no RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    await supabase.from('platform_errors').insert({
      error_type: errorType,
      message: message?.slice(0, 2000),
      stack: stack?.slice(0, 5000),
      page,
      learner_id: learnerId ?? null,
    })
  } catch {
    // Silent — don't throw from error logger
    console.error('Failed to log platform error:', message)
  }
}
