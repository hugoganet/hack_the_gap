#!/bin/zsh
set -euo pipefail

title_raw=${1:-"Untitled ADR"}

base_dir="$(cd "$(dirname "$0")/.." && pwd)"
cd "$base_dir"

decisions_dir="docs/decisions"
mkdir -p "$decisions_dir"

title_kebab=$(echo "$title_raw" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//' )

# Determine next ADR number
last_num=$(ls -1 "$decisions_dir" 2>/dev/null | grep -E '^ADR-[0-9]{4}-' | sed -E 's/^ADR-([0-9]{4})-.*/\1/' | sort -n | tail -n1)
if [ -z "${last_num:-}" ]; then
  next_num=0001
else
  next_num=$(printf "%04d" $((10#$last_num + 1)))
fi

file="$decisions_dir/ADR-${next_num}-${title_kebab}.md"

date=$(date +%F)
template="docs/templates/ADR.md"
if [ -f "$template" ]; then
  sed \
    -e "s/ADR-XXXX/ADR-${next_num}/g" \
    -e "s/Title in Sentence Case/${title_raw}/g" \
    -e "s/{{DATE}}/${date}/g" \
    -e "s/{{DECIDERS}}/solo-founder/g" \
    "$template" > "$file"
else
  cat > "$file" <<EOF
# ADR-${next_num}: ${title_raw}

Date: ${date}
Status: Proposed
Deciders: solo-founder

## Context

## Decision

## Consequences

## Alternatives Considered

## Links

EOF
fi

echo "Created $file"
