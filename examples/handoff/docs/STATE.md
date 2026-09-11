# Current work

**Feature:** [Product row import](feature/IMPORT.md)
**Blueprint:** [Implementation](blueprint/IMPORT.md)
**Worklog:** [Outcomes](worklog/IMPORT.md)
**Round:** B2
**Updated:** 2026-09-10T02:17:21+00:00
**Branch:** not-a-git-repo
**Base commit:** not-a-git-repo
**Code ref:** example-working-tree
**Workspace:** same-worktree
**Verification:** [B2 evidence](worklog/IMPORT.md#verification-b2)

## Checkpoint

B1 is complete. B2 incorrectly accepts duplicate IDs; its regression test fails.
This teaching snapshot represents stopping midway through B2.

## Next action

Implement duplicate normalized-ID rejection in src/import.mjs, then run
node --test import.demo.test.mjs from this example's root. Do not weaken the test.

## Working tree

The exported source includes unfinished B2 work in src/import.mjs. It is not a Git
commit or an agent's private memory. Transfer the entire example directory and
verify its contents; in a real repository record the observed branch/base/diff.

## Blockers

Known duplicate-ID failure. No external service, account or permission needed.

## Guardrails

The [approved decision](feature/IMPORT.md#decisions) rejects silent deduplication.
Preserve requirements and B1 behavior. Never declare Done before required checks
pass and current evidence is recorded, with this feature still selected.
