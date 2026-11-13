---
name: deploy
description: Use when deploying the Next.js app to Vercel (production). Trigger on "deploy", "ship to production", "push to vercel".
---

# Deploy to Vercel

Ship code to production.

## Steps

1. Typecheck first: `npx tsc --noEmit`
2. Deploy: `npx vercel --prod --yes`

## Notes

- Production URL: `https://campaign-tracker-jet-zeta.vercel.app`
- Env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are already set in Vercel.
- The pages are `force-dynamic`, so **data** changes flow through with no deploy — only **code** changes need a deploy.
- The repo uses `master` as the default branch (not `main`).

## Auto-deploy from GitHub (one-time setup)

1. Vercel dashboard → account → add a **GitHub Login Connection** (OAuth).
2. Project → Settings → Git → connect `rabid-roo/campaign-tracker`, production branch `master`.

After that, every push to `master` deploys automatically.
