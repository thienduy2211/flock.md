# Making agents actually follow the contract

Flock is a document convention plus a read-only checker; nothing in it can *force*
an agent. Reliable adherence comes from four layers stacked together — the first
two reduce how often steps are forgotten, the last two make a forgotten step
visible instead of silent.

## Layer 1 — The instruction file (always loaded)

`AGENTS.md` is the one file an agent reads on every session. Put the operating
rules there — including the mechanical end-of-task checklist in
[`spec/templates/AGENTS.md`](../spec/templates/AGENTS.md) — and keep
tool-specific files (`CLAUDE.md` et al.) as one-line pointers to it. Write rules
as *verifiable behavior* ("STATE.md must contain X"), not intentions
("remember to update docs").

## Layer 2 — Session-start contract

Require the first action to be observable: read `STATE.md`, then restate the
active feature, round, blockers and next action before writing code. An agent
that cannot restate them has not read the checkpoint — the miss shows up in the
first reply, not after the damage.

## Layer 3 — The checker as a gate (the deterministic layer)

This is the only layer that does not depend on the agent remembering anything:

- **Pre-commit hook** — [`spec/templates/pre-commit`](../spec/templates/pre-commit).
  Copy to `.git/hooks/pre-commit`; it fails the commit when document checks fail
  and warns when the checkpoint file is not among the staged changes.
  `FLOCK_CHECKER` points at the checker if `tools/` is not vendored;
  `FLOCK_STATE` overrides the checkpoint filename pattern.
- **CI** — run `node tools/check.mjs <repo> --handoff` (and the base check) in a
  pipeline step. A missing checkpoint section, stale evidence hash or index
  drift fails the build.

## Layer 4 — Runtime hooks

Where the agent runtime supports event hooks (stop/pre-commit reminders), have
one run the same checker and print a reminder when the checkpoint has not moved.
A hook *executes*; a written rule is only *read*.

## Honest limits

The checker verifies shape, not truth — an agent can write a checkpoint that is
formally complete and factually wrong. It also cannot prove a checkpoint was
written *at the right time*, only that one exists when checked. Layers 1–2
reduce omission frequency; layer 3 catches it. For evidence that a specific
agent actually follows the contract, run the [fresh-agent drill](HANDOFF-DRILL.md)
— do not infer it from a checker pass.
