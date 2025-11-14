#!/bin/zsh
set -euo pipefail

title=${1:-"Untitled Session"}
model=${MODEL:-"unknown"}

base_dir="$(cd "$(dirname "$0")/.." && pwd)"
cd "$base_dir"

sessions_dir="docs/ai_sessions"
mkdir -p "$sessions_dir"

date=$(date +%F)
# Count sessions for today and increment
count=$(ls -1 "$sessions_dir" 2>/dev/null | grep -E "^${date}-session-[0-9]{3}\.md$" | wc -l | tr -d ' ')
index=$(printf "%03d" $((count + 1)))
file="$sessions_dir/${date}-session-${index}.md"

template="docs/templates/session.md"
if [ -f "$template" ]; then
  sed \
    -e "s/{{DATE}}/${date}/g" \
    -e "s/{{TITLE}}/${title}/g" \
    -e "s/{{MODEL}}/${model}/g" \
    "$template" > "$file"
else
  cat > "$file" <<'EOF'
---
date: DATE_HERE
role: solo-founder
model: MODEL_HERE
files_context_loaded:
  - docs/context.md
---

# AI Session: TITLE_HERE

## Summary

- 

## Decisions

- 

## Actions

- [ ] 

## Artifacts

- 

## Notes

- 
EOF
  sed -i '' -e "s/DATE_HERE/${date}/" -e "s/TITLE_HERE/${title}/" -e "s/MODEL_HERE/${model}/" "$file"
fi

echo "Created $file"
