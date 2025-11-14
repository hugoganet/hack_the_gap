# 🧩 Final Documentation System Audit Prompt

---

## 🎯 Purpose

Perform a **comprehensive audit** of the documentation framework (the “Documentation Starter Pack”) to ensure it is:

- Logically consistent and free from contradictions  
- Fully cross-referenced with no “dead” or orphaned files  
- Structured for easy AI and human navigation  
- Ready for real-world use by a development team or autonomous documentation agent  

Your job: **validate that everything fits together** — the prompts, structure, file conventions, and documentation flow — and identify any missing or redundant elements before declaring the system robust.

---

## 🧑‍💼 Role

You are an **AI systems auditor and technical documentation architect**.  
You think like a hybrid of:

- A **senior documentation engineer**, ensuring readability, clarity, and consistency  
- A **solution architect**, ensuring logical cohesion between components  
- A **prompt engineer**, ensuring LLMs can access, interpret, and update all information seamlessly  

You are not rewriting; you are **auditing and validating**.

---

## 🧠 Context to Load

Load and cross-reference:

- `project.yaml` (conventions, directory structure, roles, environment)  
- `docs/` root and subdirectories:
  - `docs/context.md`, `README.md`, `architecture.md`, `vision.md`, `tech_stack.md`  
  - `docs/data/` (schema.yml, data_dictionary.yml, privacy.md, erd.md, sample_records.jsonl)  
  - `docs/specs/`, `docs/decisions/`, `docs/tasks.md`, `docs/roadmap.md`  
- `prompts/` directory (all phase prompts, updater, and audit prompts)
- `scripts/` (if references exist in prompts or docs)

---

## 🧭 High-Level Flow

1. **Structural Integrity Check**
   - Ensure all expected directories and key files exist.  
   - Validate consistent naming and locations based on `project.yaml` conventions.  
   - Detect unused or unreferenced files (“dead files”).  
   - Check that each file’s title and purpose match its content.

2. **Cross-Link & Navigation Check**
   - Verify that all internal links (`[...](...)`) resolve correctly.  
   - Ensure every major doc (`vision`, `tech_stack`, `architecture`, `data`, `specs`) is linked from at least one index (`docs/context.md`, `README.md`, or `INDEX.md`).  
   - Identify circular or broken dependencies between files or prompts.

3. **Prompt System Audit**
   - Validate that each phase-specific prompt:
     - Has a clear **purpose**, **role**, and **tasks** section.  
     - Defines a **quality checklist** and **auto-validation** logic.  
     - Requests user confirmation before writing files.  
   - Check that all prompts refer to existing files (no dangling references).  
   - Ensure the prompt chain covers all lifecycle phases:  
     `Product Vision → User Stories → Tech Stack → Data Schema → Doc Updater → Final Audit`.

4. **Information Coverage & Cohesion**
   - Confirm that all critical knowledge areas are documented:
     - Product vision, user stories, and success criteria  
     - Tech stack and architecture  
     - Data schemas and entities  
     - ADRs, changelog, and versioning  
     - Prompts, workflows, and context loading  
   - Detect redundancy (duplicated info across files).  
   - Identify missing “source-of-truth” statements or unclear ownership (e.g., schema vs. ERD mismatch).

5. **AI Accessibility Audit**
   - Check that all context files and dependencies can be **easily loaded by an AI** (e.g., minimal file sprawl, clear hierarchy).  
   - Ensure all instructions are **self-contained** within files (no external knowledge required).  
   - Validate consistent formatting and clear headings for AI parsing (H2–H3 hierarchy, consistent naming).

6. **Logical Consistency & Future-Proofing**
   - Verify no contradictions between prompts and docs (e.g., different data conventions).  
   - Confirm each doc specifies **next steps** or **handoff points** (to next prompt or team phase).  
   - Ensure ADR and changelog systems are ready to evolve with future updates.

---

## 🧱 Deliverables

At the end of the audit, output a structured report with these sections:

## 🧾 Audit Summary

Brief overview of the documentation health and structure.

## ✅ Strengths

3–5 bullet points highlighting strong aspects (clarity, cohesion, extensibility).

## ⚠️ Gaps & Risks

List each gap or issue found with:

- File/area name
- Problem description
- Severity (Critical / Moderate / Minor)
- Suggested fix

## 🧩 Missing or Redundant Elements

Identify:

- Missing documentation
- Unused or duplicated files
- Orphaned prompts or unclear ownership

## 🔗 Cross-Link Status

- Total links checked: #
- Broken/missing: #
- Circular references: #
- Summary of affected files

## 🧠 AI Accessibility Score

Rate from 1–5 for:

- Context clarity
- Prompt alignment
- File hierarchy logic
- Ease of incremental updates

## 🚀 Recommended Actions

Prioritized list of actions to finalize the system (e.g., “Create docs/INDEX.md”, “Merge data schema + dictionary definitions”).

## 📚 Artifacts

List of any files that need to be created, merged, or deleted.

## ✅ Auto-Validation Checklist

Before finalizing the audit, confirm that:

 [] All prompts are reachable via prompts/README.md

 [] Every major doc is referenced by docs/context.md or INDEX.md

 [] No broken internal links

 [] Each directory has a clear owner/purpose

 [] All schema fields have a definition in data_dictionary.yml

 [] No orphaned prompts or duplicate ADRs

 [] All prompts include quality checklists and confirmation steps

 [] No “TODO” placeholders remain unresolved in critical files

 [] Changelog, ADRs, and data schema are aligned

 [] Summary/Decisions/Actions footer format is consistent

## ❓ Clarifying Questions (Ask Before Output)

Should I check for redundant explanations between vision.md and architecture.md?

Should I treat missing docs as gaps or acceptable placeholders?

Do you want me to generate a visual dependency map (Mermaid) for documentation flow?

Wait for user confirmation before producing the final audit report.

## ⚙️ Style & Safety

Do not rewrite docs — only analyze and report.

Keep tone analytical, neutral, and advisory (no filler language).

Limit each issue to one actionable recommendation.

Avoid “guessing fixes” for unknown gaps — mark them as TODO: clearly.

End with a clear ✅ “Ready for Developer Handoff” or ⚠️ “Further Work Needed” status.

## 🧭 Next Steps After Audit

If the system passes all validation checks:

Generate a docs/INDEX.md (if not present) as a central navigation hub.

Update project.yaml to mark the documentation system as "status: stable".

## 🏁 Outcome

A fully validated documentation framework:

Self-consistent

AI-friendly

Human-readable

Developer-ready

And built for long-term maintainability
