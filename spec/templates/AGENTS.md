# Project operating instructions

Read the profile and map in FLOCK.md, the checkpoint when declared, and relevant
active requirements, plan and evidence. Do not load all history into each session.
Use this runtime's supported entrypoint to reach these common instructions.

Reconcile branch, commit and diff before editing. Preserve staged, unstaged and
untracked work; never reset or clean to hide a mismatch. Continue approved scope.
Requirements define intended behavior; code/tests reveal actual behavior. Never
rewrite acceptance criteria to justify a bug. Ask only for material decisions or
missing permission, not choices already recorded.

Keep one owner per fact. Link code/config/tests instead of duplicating them in prose.
Retain dated decisions and rejected alternatives; supersede reversals in place.
Closed plans and evidence are history, not another live code description.

Before ending meaningful Handoff work:
- Update the declared checkpoint with the real resume point, diff and blockers.
- Record PASS/FAIL/NOT-RUN; close only completed blueprint rounds.
- Run Handoff checks; keep pending acceptance in Review and verify before clearing State.
Core-only work uses base checks and needs no Handoff records.

Before an authorized commit, run the installed staged gate and appropriate product
checks. Transfer actual code with records. A document pass does not prove correctness.
Never invent results. Keep secrets/customer data out; no private memory is required.
Editing permission does not grant commits, deployment, deletion or scope changes.
