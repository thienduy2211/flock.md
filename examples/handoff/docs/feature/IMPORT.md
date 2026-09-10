# Product row import

**Handoff:** v1
**Status:** Building
**Target:** demo-v1
**Blueprint:** [Implementation](../blueprint/IMPORT.md)
**Worklog:** [Outcomes](../worklog/IMPORT.md)

## Goal

Normalize IDs/titles and reject repeated normalized IDs within an import batch.

## Decisions

Decided 2026-09-10 for this fictional demonstration: duplicate IDs must produce an
error. Keeping only the first/last row was rejected because it hides an ambiguous
product update. Never reverse this decision merely to make a test pass.

## Acceptance criteria

- Normal rows are trimmed without changing input order.
- Repeated IDs are rejected with a duplicate error.
- This code-only example requires no separate visual acceptance.

Out of scope: databases, networking, full CSV parsing and deployments.

## Implementation

Follow the blueprint; its Rounds list alone owns implementation progress.
