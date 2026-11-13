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

## Auto-deploy from GitHub

Already wired: every push to `master` auto-deploys production. `npx vercel --prod --yes` is only for a manual deploy.

Note: **data** changes don't need a deploy (pages are `force-dynamic`) — they auto-import to Supabase via the `import-data` GitHub Action (see `AGENTS.md`). Only **code** changes need a deploy.
