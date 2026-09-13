# Enforce the chosen contract without adding paperwork

Flock is a convention plus checkers, not an agent supervisor. Use a supported
agent entrypoint to reach short common instructions; do not assume every runtime
automatically loads a particular filename. At session start, reconcile the real
branch/diff with the declared checkpoint and relevant evidence before editing.
A short acknowledgment is enough; do not repeat entire plans into chat.

## Working-file check versus staged gate

`node tools/check.mjs PROJECT --handoff` checks files on disk. It does not know
which changes will enter a commit. Use the separate gate for that boundary:

```sh
node tools/check-staged.mjs /path/to/project
```

The gate reads the Git index (the exact staged versions), not unstaged repairs or
untracked files. It uses the same Core/Flow and Handoff checks. Handoff is selected
only by a real Handoff section in the staged FLOCK; Core needs no State file.
While Handoff has active work, every nonempty commit must include a changed
checkpoint at the exact declared path. An idle checkpoint does not need to change
for unrelated work. No filename regex or guessed STATE.md path is used.

Missing Node, Git, the gate, local objects, conflicts or exceeded bounds block the
operation. The Git command must support `--no-lazy-fetch`; older unsupported Git
fails rather than silently fetching missing objects. The gate never adds files,
changes the index, runs a checkout, invokes content filters or executes recorded
commands. Do not stage unrelated work or reset files just to obtain a pass.

A successful check still does not prove that the checkpoint is truthful, that its
facts are recent, or that product tests ran. Run actual product checks separately.

## Install the hook deliberately

Vendor the full `tools/` directory from the same Flock version, or point
`FLOCK_GATE` at that version's `tools/check-staged.mjs`. Copying only the entrypoint
without its imports does not work. In a POSIX shell or Git Bash:

```sh
hook_path="$(git rev-parse --git-path hooks/pre-commit)"
if [ -e "$hook_path" ] || [ -L "$hook_path" ]; then
  echo "Existing hook: integrate the Flock gate; do not overwrite it."
else
  mkdir -p "$(dirname "$hook_path")"
  cp spec/templates/pre-commit "$hook_path"
  chmod +x "$hook_path"
fi
```

The template path above assumes a Flock checkout; for another project, copy the
reviewed template from that checkout. Preserve existing hook commands. Check the
repository's `core.hooksPath` and the path reported by Git rather than assuming
`.git` is a directory. On Windows, run these installation commands in Git Bash.
Then test an intentionally invalid handoff in a disposable branch/repository.

## CI and runtime hooks

Run the selected normal checker in CI against the committed checkout, alongside
product tests. The staged gate is useful before a local commit; an empty CI index
does not prove that the author staged a checkpoint in an earlier commit.
For this standard's Core repository, CI's self-test exercises the staged gate
through real-Git regressions. Require relevant CI checks via branch protection where authorized;
this repository does not silently change hosting permissions or rulesets.

A supported runtime stop hook may run the normal checker as a reminder. Do not
claim runtime integration unless it was installed and tested. Local Git hooks can
be bypassed, and server/API-created commits do not run a local pre-commit hook.
Review still governs changes to the declaration, hook, checker and acceptance.
The checker has no transition database; clearing State cannot prove that a final
active-feature check occurred earlier. Use the [fresh-agent drill](HANDOFF-DRILL.md).

## Migration decision - 2026-09-13

**SUPERSEDED 2026-09-13:** the previous hook returned success when `FLOCK_CHECKER`
was missing, checked working files, and only warned when a filename matching
`FLOCK_STATE` was not staged. Replace that hook with this version; use `FLOCK_GATE`
for an external gate path. Old environment variables do not configure the new gate.
Missing prerequisites now fail closed; active checkpoint staging is mandatory.
Rejected: blocking every unstaged edit, automatic `git add`, regex filename matches
and silently skipping a missing checker. The staged view preserves unrelated work.
