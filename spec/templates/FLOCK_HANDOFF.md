# FLOCK.md

> flock: 0.3 | profile: flow

## Docs Map

| Type | Where | Answers |
|---|---|---|
| feature | docs/feature/ | What is approved and its canonical Status? |
| blueprint | docs/blueprint/ | How, and which rounds are complete? |
| worklog | docs/worklog/ | What happened and what was verified? |
| state | docs/STATE.md | Where do I resume now? |
| index | docs/ROADMAP.md | What work exists? |

## Lifecycle

Why -> What -> How -> What happened. The business reason can live in feature
Context or a separate mapped BRD. The feature owns Status/Target; the roadmap
mirrors them. The blueprint owns the only implementation round list. Worklogs
record outcomes; State holds one current resume point, not a history archive.

## Index

[docs/ROADMAP.md](docs/ROADMAP.md)

## Status Labels

`Design` | `Building` | `Review` | `Blocked` | `Done <date>` | `Parked`

## Handoff

**State:** [docs/STATE.md](docs/STATE.md)
**Done labels:** `Done`

Handoff v1 governs active work and features explicitly marked `**Handoff:** v1`.
Checkpoint within rounds. Verify evidence before Done while work is still selected.
Old completion evidence stays historical; reselect work to verify current code.

## Conventions

- Keep dated decisions and rejected alternatives; supersede reversals in place.
- Reconcile actual code with approved requirements; never edit scope to hide a bug.
- Read relevant records. Preserve existing edits; one writer at a time.
- Keep credentials/customer data out of worklogs. No private memory is required.
