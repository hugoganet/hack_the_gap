#!/bin/zsh
set -euo pipefail

usage() {
  echo "Usage: $0 <story-path-or-id> [spec-title]"
  echo "Examples:"
  echo "  $0 docs/user_stories/US-0001-allow-uploads.md"
  echo "  $0 US-0001 \"Uploads v1\""
  exit 1
}

if [ $# -lt 1 ]; then
  usage
fi

input="$1"
spec_title="${2:-}" 

base_dir="$(cd "$(dirname "$0")/.." && pwd)"
stories_dir="$base_dir/docs/user_stories"
specs_dir="$base_dir/docs/specs"
readme="$stories_dir/README.md"

mkdir -p "$specs_dir"

# resolve story file
if [[ "$input" == */* ]]; then
  story_file="$base_dir/$input"
else
  # try filename match
  story_file=$(ls "$stories_dir"/* 2>/dev/null | grep -E "/$input(-|\.|$)|/.*${input}.*\.md$" | head -n1 || true)
  if [ -z "$story_file" ]; then
    # search frontmatter id
    story_file=$(grep -lR "^id: ${input}$" "$stories_dir" 2>/dev/null | head -n1 || true)
  fi
fi

if [ -z "$story_file" ] || [ ! -f "$story_file" ]; then
  echo "Story file not found for '$input' in $stories_dir"
  exit 1
fi

# extract story id
story_id=$(grep -E '^id:' "$story_file" | head -n1 | sed -E 's/id:\s*//g' | tr -d '"')
if [ -z "$story_id" ]; then
  # fallback to filename
  story_id=$(basename "$story_file" | sed -E 's/^([Uu][Ss]-[0-9]{4}).*/\1/')
fi

# extract story title
story_title=$(grep -E '^title:' "$story_file" | head -n1 | sed -E 's/title:\s*"?//; s/"?$//' | sed -E 's/^\s+|\s+$//g')
if [ -z "$story_title" ]; then
  # fallback to first heading
  story_title=$(grep -m1 '^# ' "$story_file" | sed -E 's/^#\s*//')
fi

if [ -z "$spec_title" ]; then
  spec_title="$story_title"
fi

# generate kebab name
spec_kebab=$(echo "$spec_title" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')
spec_file="$specs_dir/feature-${spec_kebab}.md"

if [ -f "$spec_file" ]; then
  echo "Spec file already exists: $spec_file"
else
  created_date=$(date +%F)
  cat > "$spec_file" <<EOF
---
title: "${spec_title}"
story_id: ${story_id}
created: ${created_date}
status: Draft
---

# ${spec_title}

Owner: you

## Summary

Describe the feature and how it implements the story ${story_id}.

## User Stories

- Linked story: ${story_id} - see docs/user_stories/${story_file##*/}

## Acceptance Criteria

- [ ] AC1: 

## Technical Design

- Data model changes
- API changes

## Rollout

- Migration steps
- Feature flags

EOF
  echo "Created spec: $spec_file"
fi

# update story frontmatter to include spec field (insert or replace)
if grep -qE '^spec:' "$story_file"; then
  sed -E -i '' "s|^spec:.*|spec: ${spec_file#$base_dir/}|" "$story_file" 2>/dev/null || sed -E -i "s|^spec:.*|spec: ${spec_file#$base_dir/}|" "$story_file"
else
  # insert after the opening '---' block
  awk -vspec="spec: ${spec_file#$base_dir/}" 'BEGIN{inserted=0} /^---/{print; if(!inserted){print spec; inserted=1; next}} {print}' "$story_file" > "$story_file.tmp" && mv "$story_file.tmp" "$story_file"
fi

echo "Updated story $story_file with spec: ${spec_file#$base_dir/}"
