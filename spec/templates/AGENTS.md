# Project operating instructions

Read FLOCK.md, its declared current-state file and the active feature/blueprint.
Read relevant worklog evidence, not the entire archive. Follow real build/test/run
instructions; never invent commands, checks or approvals.

Before editing, reconcile actual branch, commit and diff with the checkpoint.
Preserve staged, unstaged and untracked work. Never reset or clean to hide a mismatch.
Continue approved scope; ask only for a material decision or missing permission.

Requirements describe intended behavior; code describes actual behavior. Record
discrepancies. Never change acceptance criteria merely to justify a bug. The feature
owns Status, the blueprint owns rounds, the worklog owns history/evidence, and the
state file owns the current resume point. The roadmap mirrors feature status.

Checkpoint after meaningful progress, before risky work and before handing over.
Record PASS/FAIL/NOT-RUN against actual code. Do not declare Done with required tests
or human acceptance pending. Keep the feature selected through final verification;
only then clear the checkpoint. Do not rewrite old evidence when later code changes.
Transfer real code together with documents; old chat is not required project state.

No private memory service is required. Keep secrets/customer data out of worklogs.
Permission to edit is not permission to deploy, delete data, merge or change scope.

Before ending any task, verify mechanically:
- STATE.md Updated, Round and Working tree reflect the real working tree.
- The worklog holds this session's outcome (PASS, FAIL or NOT-RUN, with evidence).
- The blueprint's Rounds checkboxes match the rounds actually closed.
- `node tools/check.mjs <repo> --handoff` exits 0.
Claiming completion without these is a protocol violation, not a shortcut.
