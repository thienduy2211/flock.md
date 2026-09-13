# Adopt the smallest useful contract

Keep existing paths, vocabulary, recorded decisions and unfinished edits. Flock
organizes information a project needs; it does not justify generating more prose.

## Pick an existing profile

| Need | Start with | Do not add by default |
|---|---|---|
| Navigation, small fixes, no active multi-session implementation | Core | A roadmap, State or a full specification pack |
| Approved behavior and a reviewable delivery cycle | Flow | Separate BRD/PRD when the feature already states the intent |
| Sequential agent switching or interrupted implementation | Flow + Handoff v1 | Parallel STATE, MEMORY, TASKS and HANDOFF records |

These are adoption choices, not a new Lite schema. A tiny fix may reuse relevant
active records. New behavior still needs explicit approved criteria; small size
does not justify silently changing scope. Core does not inherit Handoff's rules.

## Keep information, not a duplicate codebase

| Information | Maintain it how? |
|---|---|
| Approved behavior, non-goals, constraints and rejected alternatives | Keep one canonical record; date and supersede approved changes |
| Current implementation details already clear in source/configuration | Link to the relevant files; do not transcribe them |
| Coding rules a formatter, linter or test can enforce | Prefer executable configuration; document only project-specific exceptions |
| Active plan and current gaps | Keep only the relevant decisions, rounds, risks and verification steps |
| Closed plan and verification history | Keep as history; do not refresh it to describe unrelated later code |
| Current resume point | Replace the short checkpoint; put significant outcomes in the worklog |
| Disposable brainstorming | Remove only when no approved decision, rejected alternative or evidence is lost |

A document's existence is not an instruction to inject it into every request.
Read common instructions and the map first, the declared checkpoint when present,
then only the active requirement, plan and relevant evidence. Search old history
when a current decision or problem makes it relevant. Keep this policy out of the
always-loaded instructions except for the few actionable rules an agent needs.

After completing work, keep behavioral requirements usable and link test coverage
where useful. Retain decisions that tests cannot explain. Completed blueprints are
historical plans, not architecture manuals that must track every refactor. Link to
the dated decision in place; no extra decision file is required.

## Existing project opting into Handoff

Read [Handoff v1](../spec/HANDOFF.md), existing instructions, FLOCK, active records
and the actual Git diff. Reuse a checkpoint already serving that purpose. Declare
one state row and one Handoff section, including existing labels meaning Done.

Select real implementation work. Its feature owns scope and Status/Target; its
blueprint owns rounds; its worklog owns outcomes. Complete the links and mark the
feature Handoff v1. Record actual facts, including NOT-RUN when appropriate.
Do not backfill fictitious dates, approvals or evidence into completed legacy work.

Use each agent's supported entrypoint to reach the common instructions. Run base
and Handoff checks, then the [fresh-agent drill](HANDOFF-DRILL.md). Structural
checks are not a live-agent test. Install the [staged gate](ENFORCE.md) separately
when commits should be blocked on broken handoffs.

## Fresh project

Start from the selected Core/Flow template. Only a project choosing Handoff needs
[FLOCK_HANDOFF.md](../spec/templates/FLOCK_HANDOFF.md) and
[State](../spec/templates/STATE.md). Adapt the
[common instructions](../spec/templates/AGENTS.md) to the chosen profile.
Replace placeholders with observations; do not create empty files just to fill a map.

Under Handoff, planning can use Feature none. Create feature/blueprint/worklog for
actual work, then select it for implementation. Seed the declared index with:

```markdown
| Item | Target | Status | Docs |
|---|---|---|---|
```

## Prompt for a coding agent

```text
Adopt the smallest existing Flock profile that fits this project.
Inventory existing instructions, documents, approved scope and actual Git state.
Use Core unless the delivery cycle needs Flow or cross-session work needs Handoff.
Reuse paths and records. Do not copy code into prose or add a memory service.
Keep requirements and decisions; archive closed plans without rewriting history.
Do not discard edits, invent results or silently change scope.
Run checks for the selected profile; report unknowns and exact files changed.
Leave changes uncommitted unless a commit is separately authorized.
```

## Adoption decision - 2026-09-13

**SUPERSEDED 2026-09-13:** the earlier guide opened by directing every reader to
Handoff and started every fresh project with its templates. Start with Core/Flow
as appropriate; Handoff is an explicit choice. Rejected: a new competing Lite
format, mandatory document packs, deleting approved specs after shipping, and
claims that fewer files alone prove lower total cost.
