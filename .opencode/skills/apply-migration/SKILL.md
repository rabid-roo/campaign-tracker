---
name: apply-migration
description: Use when adding a column, table, or other schema change to Supabase (DDL). Trigger on "add a column", "add a table", "schema change", "run a migration".
---

# Apply a Supabase migration

Make a schema change (DDL).

## Key fact

PostgREST (Supabase's REST API) **cannot run DDL**. There is no direct DB connection string in this repo — only `NEXT_PUBLIC_SUPABASE_URL` + the service-role/anon keys.

## Steps

1. Write the migration in `supabase/migrations/NNNN_name.sql` (e.g. `0007_foo.sql`).
2. Apply it via ONE of:
   - **Supabase SQL editor** (dashboard → SQL editor): paste the SQL and run.
   - **`supabase db push`** (needs the Supabase CLI + a linked project / DB password).

## Gotchas

- If the site's code reads a column before it exists, the field is just `undefined` at runtime (no crash), but the feature won't show until the column exists **and** is populated.
- After the migration, run any data-backfill step (e.g. a tagging/update script).
