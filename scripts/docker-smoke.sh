#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export HTTP_BIND=127.0.0.1 HTTP_PORT=8080
export SITE_URL=http://127.0.0.1:8080
export TYPING_LEADERBOARD_ADMIN_KEY="$(node -p 'require("node:crypto").randomBytes(32).toString("hex")')"
project="device-lab-qa-${GITHUB_RUN_ID:-local}-${GITHUB_RUN_ATTEMPT:-1}-$$"
compose=(docker compose --project-name "$project")
mkdir -p artifacts/docker
cleanup() {
  "${compose[@]}" logs --no-color --tail=200 > artifacts/docker/logs.txt 2>&1 || true
  "${compose[@]}" ps --all --format json > artifacts/docker/containers.json || true
  "${compose[@]}" down --remove-orphans --volumes
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
result_id="$(node scripts/smoke-typing-leaderboard.mjs http://127.0.0.1:8080 publish)"
"${compose[@]}" restart app
wait_healthy "$app_id"
node scripts/smoke-http.mjs http://127.0.0.1:8080
node scripts/smoke-typing-leaderboard.mjs http://127.0.0.1:8080 moderate "$result_id"
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
"${compose[@]}" up -d --no-build --no-deps --force-recreate --wait --wait-timeout 120 app
new_app_id="$("${compose[@]}" ps -q app)"
[[ "$new_app_id" != "$app_id" ]]
wait_healthy "$new_app_id"
"${compose[@]}" restart nginx
node scripts/smoke-typing-leaderboard.mjs http://127.0.0.1:8080 verify-hidden "$result_id"
"${compose[@]}" exec -T app node -e 'const db = new (require("node:sqlite").DatabaseSync)(process.env.TYPING_LEADERBOARD_DB, { readOnly: true }); require("node:assert/strict").equal(db.prepare("SELECT hidden FROM typing_results WHERE id = ?").get(process.argv[1])?.hidden, 1)' "$result_id"
echo 'Docker smoke passed: build, health, proxy, locales, private Node port, shutdown, and SQLite persistence across restart and recreate.'
