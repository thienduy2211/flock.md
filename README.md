# FLOCK.md

A document-first project handoff for humans and interchangeable coding agents.
The project owns its requirements, decisions, checkpoint and evidence. No memory
server, vector database, agent SDK or cloud account is required.

**Base: Flock 0.3 draft. Optional extension: Handoff v1 draft.**
Core and Flow remain available without the handoff extension.

## Start here

| Need | Read |
|---|---|
| Understand Core / Flow | [Base specification](spec/SPEC.md) |
| Continue work with a different agent | [Handoff v1](spec/HANDOFF.md) |
| Adopt without moving existing documents | [Adoption guide](docs/ADOPT.md) |
| See an unfinished feature with a real failing check | [Worked example](examples/handoff/README.md) |
| Run the checks and understand their limits | [Checker reference](docs/CHECKER.md) |
| Keep agents from skipping the checkpoint | [Enforcement guide](docs/ENFORCE.md) |
| Test your actual agents with no old chat | [Fresh-agent drill](docs/HANDOFF-DRILL.md) |
| Consult the previous adoption/migration prompts | [Preserved previous README](ADOPTION.md) |

ADOPTION.md preserves the previous README verbatim, including its upstream
references. Those prompts predate this extension. For Handoff v1, use the local
spec/HANDOFF.md and docs/ADOPT.md, not an upstream version lacking the extension.

## One fact, one owner

| Question | Canonical location |
|---|---|
| How should agents work and verify changes? | Common agent instructions, normally AGENTS.md |
| Where do project documents live? | FLOCK.md |
| What is approved, out of scope, and the current Status/Target? | Feature document |
| How is it built; which rounds are complete? | Blueprint document |
| What happened, failed or proved completion? | Worklog document |
| Where exactly do I resume now? | One declared checkpoint, normally docs/STATE.md |
| What work exists? | Roadmap: an index mirroring the feature, not another authority |

Code describes what **is** implemented. Approved requirements describe what
**must be** implemented. Record discrepancies; never change acceptance criteria
merely to make incorrect code appear correct.

## Workflow

Read the common instructions -> FLOCK -> current state -> relevant feature,
blueprint and worklog evidence. Reconcile actual branch, commit, existing edits
and required services before writing. Preserve unfinished work.

Work within approved scope. Keep round progress only in the blueprint. Checkpoint
after meaningful progress, before risky work, and before handing over; do not wait
for an entire round to end. Record PASS, FAIL or NOT-RUN honestly. Keep work in
Review while required acceptance is pending. Transfer code together with the docs.

A known failing test can be handed over. That means the failure and next action
are clear, not that the feature is Done. Select the feature in State and run the
handoff checks before closing it. Later archived evidence remains historical;
it must not be rewritten just because another feature changes the same file.

## Check

The optional checker uses only Node built-ins. No npm install is needed.
Node 18.20+ is the compatibility target; see the verified runtime in the checker
reference. From a checkout of this repository:

```sh
node tools/check.mjs /path/to/project
node tools/check.mjs /path/to/project --handoff
node tools/check.mjs /path/to/project --handoff --json
node tools/check.mjs --self-test
```

The base command checks Core/Flow. `--handoff` explicitly selects the stronger
contract. Exit 0 means the selected document checks passed; 1 is a contract
violation; 2 is usage trouble or an incomplete scan. Normal checks only read files:
no Git command, product command, model call, network request or document mutation.

A checker pass does not prove product correctness, approval or evidence coverage.
Hashes only detect changes to listed files. The receiving agent must inspect the
real diff and run the project's appropriate checks.

## Keep it small

Reuse existing paths and a working checkpoint file. Do not create parallel STATE,
HANDOFF, MEMORY and TASKS records for the same work. Small fixes can reuse an
existing feature. Read relevant history on demand, not all worklogs at startup.
One writer at a time is assumed; distributed scheduling is outside scope.

Agent-specific entrypoints should point to the common instructions. The included
CLAUDE.md uses `@AGENTS.md`; for another agent, use its supported entrypoint or
explicitly ask it to read AGENTS.md. Verify in a fresh session rather than promising
universal filename support. See the [official file import guide](https://code.claude.com/docs/en/memory).

## History and attribution

Flock originated with [RepoFlock](https://github.com/repoflock/flock.md).
[Base history](CHANGELOG.md), the original specification, and its
[CC BY 4.0 license](LICENSE) are preserved. This fork's optional extension is
recorded separately in [HANDOFF-CHANGELOG.md](HANDOFF-CHANGELOG.md).
