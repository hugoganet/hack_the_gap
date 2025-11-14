#!/bin/zsh
set -euo pipefail

# Usage:
#   ./scripts/collect_diff_for_ai.sh [<commit_range>]
# Examples:
#   ./scripts/collect_diff_for_ai.sh               # defaults to HEAD~1..HEAD
#   ./scripts/collect_diff_for_ai.sh origin/main...HEAD
#   make docs-update range="origin/main...HEAD"

commit_range=${1:-"HEAD~1..HEAD"}

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"

# Resolve changed files in the range
changed_files=$(git diff --name-only "$commit_range" || true)

# If no changes, exit gracefully
if [ -z "$changed_files" ]; then
  echo "No changes detected for range: $commit_range"
  exit 0
fi

# Output file under ai_sessions for easy loading by AI
stamp=$(date +%Y-%m-%d-%H%M%S)
outfile="docs/ai_sessions/auto-diff-${stamp}.md"
mkdir -p "docs/ai_sessions"

{
  echo "---"
  echo "commit_range: \"$commit_range\""
  echo "generated_at: \"$(date +%F)\""
  echo "---"
  echo
  echo "# Auto-generated diff payload for AI Doc Updater"
  echo
  echo "Commit range: $commit_range"
  echo
  echo "## Changed Files"
  echo
  for f in ${(f)changed_files}; do
    echo "- $f"
  done
  echo
  echo "## Diff Chunks"
  echo
  for f in ${(f)changed_files}; do
    echo "### $f"
    echo '```diff'
    git --no-pager diff "$commit_range" -- "$f"
    echo '```'
    echo
  done

  cat <<'INSTRUCTIONS'
## How to use with prompts/ai_doc_update_prompt.md

- Load this file alongside:
  - prompts/ai_doc_update_prompt.md (as your instruction)
  - docs/context.md, project.yaml
- Provide the following inputs:
  - commit_range: value in frontmatter above
  - changed_files: list in "Changed Files"
  - diff_chunks: the per-file diffs below
- Ask the AI to output minimal patch blocks per file. Review and apply.
INSTRUCTIONS
} > "$outfile"

echo "Wrote $outfile"

echo
echo "Next steps (no API keys needed):"
echo "1) Open $outfile in your editor."
echo "2) Start a chat with your AI assistant (Copilot/Claude)."
echo "3) Provide prompts/ai_doc_update_prompt.md as the instruction, and paste the diff payload from $outfile."
echo "4) Apply the returned patch blocks to update your docs."
