#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export HTTP_BIND=127.0.0.1 HTTP_PORT=8080
export SITE_URL=http://127.0.0.1:8080
project="device-lab-qa-${GITHUB_RUN_ID:-local}"
compose=(docker compose --project-name "$project")
mkdir -p artifacts/docker
cleanup() {
  "${compose[@]}" logs --no-color --tail=200 > artifacts/docker/logs.txt 2>&1 || true
  "${compose[@]}" ps --all --format json > artifacts/docker/containers.json || true
  "${compose[@]}" down --remove-orphans
}
trap cleanup EXIT
wait_healthy() {
  local id="$1"
  for attempt in {1..40}; do
    if [[ "$(docker inspect --format '{{.State.Health.Status}}' "$id")" == healthy ]]; then return 0; fi
    sleep 2
  done
  echo 'Application did not become healthy.' >&2
  return 1
}
"${compose[@]}" config --quiet
"${compose[@]}" up -d --build --wait --wait-timeout 180
app_id="$("${compose[@]}" ps -q app)"
wait_healthy "$app_id"
[[ -z "$(docker port "$app_id")" ]] || { echo 'Node port is public.' >&2; exit 1; }
"${compose[@]}" exec -T nginx nginx -t
node scripts/smoke-http.mjs http://127.0.0.1:8080
"${compose[@]}" restart app
wait_healthy "$app_id"
node scripts/smoke-http.mjs http://127.0.0.1:8080
"${compose[@]}" stop --timeout 15 app
docker inspect --format '{{json .State}}' "$app_id" > artifacts/docker/shutdown.json
node --input-type=module <<'NODE'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const state = JSON.parse(readFileSync('artifacts/docker/shutdown.json', 'utf8'));
assert.equal(state.Status, 'exited');
assert.equal(state.Running, false);
assert.equal(state.OOMKilled, false);
assert.equal(state.Error, '');
// Next.js 16.4.3 performs cleanup, then exits with 128 + SIGTERM (15).
assert.equal(state.ExitCode, 143);
console.log('Shutdown verified: SIGTERM exit 143, not OOM or forced SIGKILL.');
NODE
"${compose[@]}" start app
wait_healthy "$app_id"
node scripts/smoke-http.mjs http://127.0.0.1:8080
echo 'Docker smoke passed: build, health, proxy, locales, private Node port, restart, shutdown.'
