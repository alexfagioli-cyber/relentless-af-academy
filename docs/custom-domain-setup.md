# Custom Domain Setup

## Steps

1. **Buy domain** — e.g., `academy.relentlessaf.com` or `learn.relentlessaf.com`

2. **Vercel dashboard** → Project → Settings → Domains → Add
   - Add the domain
   - Vercel will provide DNS records (CNAME or A record)
   - Update your DNS provider (GoDaddy) with the records

3. **Update Supabase Site URL**
   - Supabase Dashboard → Authentication → URL Configuration
   - Change Site URL to `https://academy.relentlessaf.com`
   - Add `https://academy.relentlessaf.com/auth/confirm` to Redirect URLs

4. **Update any hardcoded URLs**
   - Check `src/app/api/admin/invite/route.ts` — the `redirectTo` uses `request.nextUrl.origin` (auto-adapts, no change needed)
   - Verify no hardcoded `vercel.app` URLs exist in the codebase

5. **SSL** — Vercel handles this automatically for custom domains

6. **Test** — verify auth flow works end-to-end on the new domain
