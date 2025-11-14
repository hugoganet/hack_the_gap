#!/bin/zsh
set -euo pipefail

title_raw=${1:-"Untitled Feature"}

base_dir="$(cd "$(dirname "$0")/.." && pwd)"
cd "$base_dir"

specs_dir="docs/specs"
mkdir -p "$specs_dir"

title_kebab=$(echo "$title_raw" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//' )
file="$specs_dir/feature-${title_kebab}.md"

date=$(date +%F)
template="docs/templates/feature_spec.md"
if [ -f "$template" ]; then
  sed \
    -e "s/{{TITLE}}/${title_raw}/g" \
    -e "s/{{DATE}}/${date}/g" \
    "$template" > "$file"
else
  cat > "$file" <<EOF
# Feature Spec: ${title_raw}

Owner: you
Status: Draft
Last Updated: ${date}

## Summary

## User Stories

## Acceptance Criteria

## UX & Flows

## Scope

## Technical Design

## Rollout

EOF
fi

echo "Created $file"
