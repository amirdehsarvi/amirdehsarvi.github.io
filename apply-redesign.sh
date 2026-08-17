#!/usr/bin/env bash
# Applies the redesign to amirdehsarvi.github.io and pushes it,
# keeping the current site as a branch + tag you can return to.
#
#   cd ~/Documents/GitHub/amirdehsarvi.github.io
#   bash apply-redesign.sh
#
set -euo pipefail
cd "$(dirname "$0")"

echo "==> Tidying up scratch files"
rm -f .git/__cowork_scratch .git/__cowork_stale_index_lock

# This script and its bundle are untracked on purpose — ignore them here.
DIRT="$(git status --porcelain | grep -vE '^\?\? (apply-redesign\.sh|redesign\.bundle)$' || true)"
if [ -n "$DIRT" ]; then
  echo "!! You have uncommitted changes. Commit or stash them first:"
  echo "$DIRT"
  exit 1
fi

echo "==> Importing the redesign commit from redesign.bundle"
git fetch redesign.bundle \
  'refs/heads/master:refs/heads/redesign' \
  'refs/tags/v1-academicpages:refs/tags/v1-academicpages'

echo "==> Saving the current site as 'pre-redesign-backup'"
git checkout master
git branch -f pre-redesign-backup master

echo "==> Fast-forwarding master to the redesign"
git merge --ff-only redesign

echo "==> Pushing to GitHub"
git push origin master
git push origin pre-redesign-backup
git push origin v1-academicpages

echo "==> Cleaning up"
git branch -d redesign
rm -f redesign.bundle

cat <<'EOF'

Done. https://amirdehsarvi.github.io rebuilds in a minute or two.
Check progress at https://github.com/amirdehsarvi/amirdehsarvi.github.io/actions

To go back at any point:
    git reset --hard pre-redesign-backup && git push --force-with-lease

Last thing, delete this script:
    rm apply-redesign.sh
EOF
