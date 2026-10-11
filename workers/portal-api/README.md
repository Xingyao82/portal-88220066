# 88220066.xyz API source

This directory contains the complete source for the production `portal-88220066-api` Worker, migrated from the verified October 11 repair. The root website is an older Git snapshot and must not be deployed over the current Pages site without reconciling its frontend changes.

## Validate and deploy

Use Node.js 22 and run inside this directory:

```sh
npm ci
npm run check
# First-time database setup only (already applied in production):
npx wrangler d1 execute portal_88220066_news --remote --file schema/001_api_success_snapshots.sql
# Authenticate with Cloudflare, then deploy:
npx wrangler login
npm run deploy
```

The Worker serves `/api/*` and the A-share page notice. Existing more-specific Worker routes take priority. Database IDs and account IDs are resource identifiers; tokens and recorder secrets stay in Cloudflare and are never committed.

The current static frontend stays on Cloudflare Pages. A-share HTML is read from the current Pages deployment. Authorized cron recorder requests still delegate to the pinned September Pages deployment so its existing secret remains authoritative; do not delete that deployment until the recorder is migrated and verified.

## Recovery

The build always compiles all Functions and refuses unexpected compiler output. Tests exercise upstream failover, missing adjusted prices, invalid HTML responses, persisted snapshots and snapshot expiry. Successful snapshots are stored in D1 and explicitly labelled when stale.

A-share fallback provides Sina industry daily averages only. Concept and multi-day metrics remain unavailable when Eastmoney fails. These values are not invented.

Last verified production version at migration: `62f922fe-a923-4fa9-91eb-21fc9549bbc7`.

CI validates this directory on pull requests and source pushes. Production deployment remains an explicit command after validation; no Cloudflare credential is needed for CI.
