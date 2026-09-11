# Adopt without reorganizing a project

Use the [optional Handoff v1 contract](../spec/HANDOFF.md), not an external memory
system. Existing projects keep their paths, house vocabulary and recorded decisions.

## Existing project

Inspect existing agent instructions, map, index, active work and Git diff. Preserve
unfinished edits and reconcile ownership before changing touched files. Reuse the
existing checkpoint if it already fills that role. Declare one state row and one
Handoff section in FLOCK, naming which existing labels mean Done.

Choose active implementation work. Keep product requirements and canonical Status
in its feature; round progress only in its blueprint. Link the worklog/index and
mark the feature Handoff v1. Capture the actual checkpoint even if verification is
NOT-RUN. Completed legacy features need not be backfilled. Review/Blocked are useful
new states, not a reason to mass-rename existing records.

Use a thin route from each agent's supported entrypoint to the common instructions,
then FLOCK/State. Do not duplicate instructions or state. Run base and handoff checks,
then use a fresh agent with no old chat. Do not call document checks a live-agent test.

## Fresh project

Copy the [FLOCK handoff template](../spec/templates/FLOCK_HANDOFF.md). Adapt the
[common instructions](../spec/templates/AGENTS.md) and [State](../spec/templates/STATE.md).
Templates are scaffolding, not finished observations: replace every placeholder.
For idle/planning work, use Feature none and real state observations; omit active-
only labels. Seed the declared roadmap with this empty table:

```markdown
| Item | Target | Status | Docs |
|---|---|---|---|
```

Create feature/blueprint/worklog only for actual work. Do not invent history or tests.
A small fix can reuse existing records. Select a feature in State after it advances
into implementation and has a real blueprint and worklog.

## Prompt for a coding agent

```text
Adopt this checkout's Flock Handoff v1 in the current project.
Read spec/HANDOFF.md and docs/CHECKER.md first. Inventory existing docs and actual Git state.
Reuse existing paths. Do not move files, rewrite history, discard edits or add memory services.
Add only missing common instructions, one declared checkpoint and active-work links.
Keep approved requirements separate from observed code. Never invent test results or approvals.
Run base and --handoff checks. Report unknowns and exact files changed.
Leave changes uncommitted unless I separately authorize a commit.
```

Use [the fresh-agent drill](HANDOFF-DRILL.md) as actual acceptance. Filename support
alone does not prove an agent obeys the same project contract.
