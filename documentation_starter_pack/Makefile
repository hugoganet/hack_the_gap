# Simple helpers for documentation workflows

.PHONY: new-session new-adr new-spec

new-session:
	@./scripts/new_session.sh "$(title)"

new-adr:
	@./scripts/new_adr.sh "$(title)"

new-spec:
	@./scripts/new_spec.sh "$(title)"

new-story:
	@./scripts/new_story.sh "$(feature)" "$(title)" "$(persona)" "$(priority)" "$(estimate)"

promote-story:
	@./scripts/promote_story.sh "$(id)" "$(title)"

.PHONY: docs-update
docs-update:
	@./scripts/collect_diff_for_ai.sh "$(range)"
