# Handoff extension changes

## v1 draft - 2026-09-10

- Optional document-first handoff: ownership, one current checkpoint, interrupted-
  round resume, actual code identity and evidence-gated completion.
- Preserve base Core/Flow 0.3 and historical CHANGELOG. Add no memory system, database,
  scheduler, agent platform, package dependency or automatic document writer.
- Fix ambiguous blueprint advice: observed code is not authority to change approved
  requirements. Feature acceptance remains distinct from implementation.
- Remove duplicate B1/B2 feature progress; blueprint owns the only round checklist.
- Extend templates with intermediate checkpoints, evidence and thin agent entrypoints.
- Replace ad-hoc parsing with shared readers: validate tables, ignore examples,
  expand documented globs, recurse, match exact status/date, reject symlinks and
  encoded escape paths, report scan limits/errors instead of silent zero counts.
- Correct MUST/SHOULD severity and check Flow backlinks. Preserve old blueprints alias.
- Add --handoff, --json, import-safe API and exit 2 for incomplete checks.
- Separate current verification from historical evidence. Retesting appends evidence;
  later code changes never require rewriting archived completion history.
- Add a complete intentionally unfinished example, automated regressions and a
  manual fresh-agent drill. The automated suite does not run live coding agents.
- Preserve the previous README verbatim as ADOPTION.md at the same directory level.
  Its relative links survive, but upstream prompts predate this optional extension.

Decision (2026-09-10): keep the base standard small and put handoff in an opt-in
versioned extension. Rejected: external memory, implicit status mutation, automatic
hash refresh, reading all history at startup, and state files owned by each agent.

## v1 draft - maintenance 2026-09-12

- Add `.gitattributes` (`* text=auto eol=lf`): recorded SHA-256 fingerprints cover
  raw bytes, so a CRLF checkout (Windows `core.autocrlf`) read honest evidence as
  stale. Rejected: normalizing line endings inside the checker — a byte-exact
  fingerprint is the point; documented in docs/CHECKER.md.
- Add CI running the self-test and example checks on Linux and Windows.
- `Feature:` idle marker `none` is now matched case-insensitively.
- Document that opening labels are read up to the first level-2 heading, and mark
  ADOPTION.md as the archived pre-extension README.
- Warn when the Docs Map declares multiple `index` locations (only the first is
  used) instead of silently dropping the rest.
- An index row linking a directory is a broken-link warning, not an incomplete
  scan; only genuine read failures still produce exit 2.
- spec/templates/AGENTS.md gains a mechanical end-of-task checklist so a missing
  checkpoint is a protocol violation, not an oversight. New pre-commit hook
  template fails commits on broken document checks and warns when the checkpoint
  file is unstaged; docs/ENFORCE.md explains the four enforcement layers.

## v1 draft - lean adoption and staged gate 2026-09-13

- Keep Core, Flow and optional Handoff; do not introduce a competing Lite schema.
  Adoption now starts with the smallest useful existing profile. Templates avoid
  duplicate code descriptions, mandatory extra rounds and mirrored Status fields.
- Separate durable requirements/decisions, active plans/checkpoints and historical
  plans/evidence. Read relevant context on demand; preserve approved history.
- Add `tools/check-staged.mjs` with a read-only Git-index backend. Normal checks
  remain filesystem-only. Validate staged blobs, not unstaged repairs or untracked
  files; retain the existing parser, bounds, SHA-256 evidence and safety rules.
- The new hook blocks missing prerequisites and missing active checkpoint staging.
  Resolve the checkpoint from FLOCK, not a filename regex. Support Core and idle
  work without synthetic State changes. Never stage, reset or clean user edits.
- Expand the existing self-test entrypoint with real-Git regression tests, so the
  current CI matrix exercises the gate without a workflow or permission change.
- Add a controlled fresh-agent comparison protocol including documentation upkeep,
  retries and correctness; no live-agent benchmark or token savings are claimed.

Decision (2026-09-13): keep information code cannot establish reliably, not a prose
copy of implementation. Retain approved intent and rejected alternatives after
shipping; completed plans are historical rather than another live code manual.
Rejected: deleting all specs, loading all docs every session, automatic staging,
and forcing every project into the full handoff workflow.

**SUPERSEDED 2026-09-13:** the 2026-09-12 hook's warning-only checkpoint policy and
success on a missing checker. The staged gate now fails closed. `FLOCK_GATE`
replaces the old hook's `FLOCK_CHECKER`/`FLOCK_STATE` configuration; see ENFORCE.md.

Verification (local Linux, Node 22.16.0, Git 2.47.3):
- `node tools/check.mjs --self-test`: PASS, 120 tests (92 unchanged + 28 new),
  zero failures and zero skips. New cases include actual temporary Git commits,
  staged/unstaged divergence, exact custom checkpoint paths, missing prerequisites,
  missing objects, conflicts, bounds, read-only behavior and concurrent index/HEAD changes.
- Base checks for `examples/minimal` and `examples/full`: exit 0; the original
  illustrative/planned-location warnings remain intentional, not newly created docs.
- `node tools/check.mjs examples/handoff --handoff`: exit 0. Its product checkpoint
  remains intentionally FAIL with B2 unfinished; the suite asserts that failure.
- Live-agent A/B measurements: NOT-RUN. CI platform results belong to the actual
  workflow runs; this local evidence alone does not certify every runtime.
