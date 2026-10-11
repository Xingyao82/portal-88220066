#!/bin/sh
set -eu
cd "$(dirname "$0")"
node test-resilience.mjs
node build.mjs
node --check worker.mjs
npx wrangler deploy --config wrangler.jsonc
curl --fail --silent --show-error https://88220066.xyz/api/health
