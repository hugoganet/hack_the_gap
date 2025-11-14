#!/bin/zsh
set -euo pipefail

usage() {
  echo "Usage: $0 \"Feature Name\" \"Story title\" [persona] [priority] [estimate]"
  echo "Example: $0 \"Uploads\" \"Allow user uploads up to 10MB\" \"Registered user\" P0 M"
  exit 1
}
#!/bin/zsh
set -euo pipefail

usage() {
  echo "Usage: $0 \"Feature Name\" \"Story title\" [persona] [priority] [estimate]"
  echo "Example: $0 \"Uploads\" \"Allow user uploads up to 10MB\" \"Registered user\" P0 M"
  exit 1
}

if [ $# -lt 2 ]; then
  usage
fi

feature="$1"
title="$2"
persona="${3:-User}"
priority="${4:-P1}"
estimate="${5:-S}"

base_dir="$(cd "$(dirname "$0")/.." && pwd)"
stories_dir="$base_dir/docs/user_stories"
readme="$stories_dir/README.md"
mkdir -p "$stories_dir"

if [ ! -f "$readme" ]; then
  echo "ERROR: user stories README not found at $readme"
  exit 1
fi

# Find last numeric ID used across story files and README
last=$(grep -hoE 'ID: US-[0-9]{4,}' "$stories_dir"/*.md 2>/dev/null | sed -E 's/ID: US-//' | sort -n | tail -n1 || echo "")
if [ -z "$last" ]; then
  next=1
else
  next=$((10#$last + 1))
fi
id=$(printf "US-%04d" "$next")

# Make filename
title_kebab=$(echo "$title" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')
file_basename="${id}-${title_kebab}.md"
file_path="$stories_dir/$file_basename"

created_date=$(date +%F)

cat > "$file_path" <<EOF
---
id: ${id}
feature: "${feature}"
title: "${title}"
persona: "${persona}"
priority: "${priority}"
estimate: "${estimate}"
created: ${created_date}
status: Draft
---

# ${title}

## Description

Describe the user need and context here.

## Acceptance Criteria

- [ ] AC1: (observable, testable)

## Notes / Constraints

- 

## Spec

- Link spec when available: docs/specs/feature-...md

## Tasks

- Link tasks or add checklist in `docs/tasks.md` under Backlog

EOF

# Add index entry into README.md under feature heading (create heading if missing)
entry="- [${id}](${file_basename}) - ${title}"

lineno=$(grep -n -F "## ${feature}" "$readme" 2>/dev/null | tail -n1 | cut -d: -f1 || true)
if [ -n "$lineno" ]; then
  # insert after the heading line; if there's already a list, append after last consecutive list line
  awk -vln="$lineno" -ventry="$entry" '
    NR==ln{print; next}
    NR>ln && !inserted{
      if(/^\s*-/){print; next}
      print entry; inserted=1; print; next
    }
    {print}
    END{if(!inserted) print entry}
  ' "$readme" > "$readme.tmp" && mv "$readme.tmp" "$readme"
else
  printf "\n## %s\n\n%s\n" "$feature" "$entry" >> "$readme"
fi

echo "Created $file_path and added index entry in $readme"
