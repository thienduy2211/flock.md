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
