# FLOCK.md

A small project contract for humans and interchangeable coding agents.
Code owns implemented behavior. Project files retain approved intent, decisions,
the current handoff and verification evidence that code alone cannot establish.
No memory server, vector database, agent SDK or cloud account is required.

**Base: Flock 0.3 draft. Optional extension: Handoff v1 draft.**
Do not generate a parallel description of the codebase merely to adopt Flock.

## Choose the smallest useful adoption

| Situation | Use |
|---|---|
| Existing docs, small fixes or no long-running implementation | Core: a Docs Map; reuse existing records |
| Work benefits from explicit requirements and implementation rounds | Flow: feature, blueprint and worklog |
| One person changes agents or resumes across sessions | Flow + Handoff: one checkpoint and linked evidence |

These are existing profiles, not new mandatory document packs. A separate BRD,
PRD, architecture manual or code-standards file is not required merely because
an agent is used. See [right-sized adoption](docs/ADOPT.md).

## Start here

| Need | Read |
|---|---|
| Understand Core / Flow | [Base specification](spec/SPEC.md) |
| Continue work with another agent | [Handoff v1](spec/HANDOFF.md) |
| Adopt and keep documentation small | [Adoption guide](docs/ADOPT.md) |
| See an unfinished feature with a real failing check | [Worked example](examples/handoff/README.md) |
| Check records and understand what a pass means | [Checker reference](docs/CHECKER.md) |
| Block incomplete staged handoffs before committing | [Enforcement guide](docs/ENFORCE.md) |
| Measure actual agents, quality and total cost | [Fresh-agent drill](docs/HANDOFF-DRILL.md) |
| Consult the previous adoption/migration prompts | [Preserved previous README](ADOPTION.md) |

## One fact, one owner

| Question | Canonical location |
|---|---|
| How should agents work and verify changes? | Common instructions, normally AGENTS.md |
| Where are relevant project documents? | FLOCK.md |
| What is approved, out of scope, and its Status/Target? | Feature |
| Which implementation decisions and rounds are active? | Blueprint |
| What happened, failed or was verified? | Worklog |
| Where exactly do I resume now? | One declared checkpoint |
| What work exists? | Roadmap: a mirror of the feature, not another authority |

Code describes what **is** implemented; approved requirements describe what
**must be** implemented. Tests check selected examples of that contract, not every
business intention. Record discrepancies; never rewrite acceptance criteria to
make incorrect code appear correct. Prefer links to code, tests and configuration
over prose that duplicates them. Omit optional mirrored Status labels in new
blueprints/worklogs rather than create more fields to maintain.

## Workflow

Read common instructions -> FLOCK -> checkpoint when declared -> relevant active
records and evidence. Reconcile actual branch, commit, existing edits and required
services before writing. Do not load every specification or worklog at startup.

Implement approved scope. Under Handoff, checkpoint meaningful progress and record
PASS, FAIL or NOT-RUN honestly. Keep required acceptance in Review. Select the
feature through its final verification before clearing State. Transfer actual code
with the docs; a summary cannot transfer uncommitted files or runtime services.

Keep durable requirements and decisions. A completed plan and its worklog are
historical, not a second live description of today's code. Do not keep refreshing
old plans or old evidence; append new verification when work is reopened.

## Check

Node 18.20+ is the compatibility target. No npm install is needed.

```sh
node tools/check.mjs /path/to/project
node tools/check.mjs /path/to/project --handoff
node tools/check-staged.mjs /path/to/project
node tools/check.mjs --self-test
```

The normal checker reads local files only: no Git, model, network or product command.
The separate staged gate explicitly reads local Git index objects, selects Handoff
only when declared, and requires the active checkpoint among staged changes.
It never stages files, checks out code, runs filters or refreshes hashes. Git must
support `--no-lazy-fetch`; unavailable objects or tools block the gate, not trigger
a download or a silent pass. Both commands support `--json`; see the reference.

**A document-check pass is not a product-test pass or proof of approval.**
Run the project's real checks separately. Hashes cover only the files listed;
unknown requirements, omitted dependencies and false reports still need review.
No token savings or universal agent compatibility are claimed without measurement.

## Agent entrypoints and history

Keep tool-specific entrypoints as pointers to common instructions. The included
CLAUDE.md uses `@AGENTS.md`; other agents need their supported entrypoint or an
explicit request to read AGENTS.md. Verify this in a fresh session. One writer at
a time is assumed; distributed agent scheduling is outside scope.

Flock originated with [RepoFlock](https://github.com/repoflock/flock.md).
[Base history](CHANGELOG.md), the original specification and its
[CC BY 4.0 license](LICENSE) are preserved. This fork's optional extension is
recorded in [HANDOFF-CHANGELOG.md](HANDOFF-CHANGELOG.md).
ADOPTION.md preserves the previous README and its upstream references; those
prompts predate Handoff v1. Use the local extension and adoption guide for Handoff.
