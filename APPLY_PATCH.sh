#!/usr/bin/env bash
# Run from the repo root AFTER unzipping this patch over it:  bash APPLY_PATCH.sh
set -euo pipefail
# 032 belongs to the separate HYPE DROP database; keep it out of HEYBIO migrations.
if [ -f supabase/migrations/032_hype_drop_handoff_replay_protection.sql ]; then
  mkdir -p docs/hype-drop-db
  git mv supabase/migrations/032_hype_drop_handoff_replay_protection.sql docs/hype-drop-db/ 2>/dev/null \
    || mv supabase/migrations/032_hype_drop_handoff_replay_protection.sql docs/hype-drop-db/
fi
# failed-build log must not be committed
git rm -q --cached build.log 2>/dev/null || true
rm -f build.log
grep -qxF 'build.log' .gitignore 2>/dev/null || echo 'build.log' >> .gitignore
echo "Patch applied. Now run migrations 034, 035, 036 in Supabase SQL editor (in order)."
