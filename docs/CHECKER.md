# Checker reference

No install step or package dependencies. Node 18.20+ is the compatibility target;
local execution was verified on Linux with Node 22.16.0, and CI runs the self-test
and example checks on Linux and Windows with Node 18.20 and 22.

| Command | Scope |
|---|---|
| `node tools/check.mjs PROJECT` | Base Core/Flow, counts and warnings |
| `node tools/check.mjs PROJECT --handoff` | Also the optional Handoff v1 contract |
| `node tools/check.mjs PROJECT --json` | Structured result without a prose prefix |
| `node tools/check.mjs --self-test` | Filesystem and staged-gate tests in disposable fixtures |
| `node tools/check-staged.mjs PROJECT [--json]` | Explicit Git-index check and active-checkpoint staging policy |

Exit 0: selected document checks passed. Exit 1: base MUST or selected handoff
violation. Exit 2: invalid usage, unreadable/unsafe input or incomplete scan.
Warnings do not become MUST errors. Planned missing directories remain valid for
fresh adoptions. `--` separates flags from a path beginning with `-`.

The import-safe API `check(repo, options)` retains lines/must and adds warnings,
errors, metrics and handoff. `exitCode(result)` applies CLI policy. options.handoff
selects the extension. Optional limits: maxFiles, maxBytes, maxEntries and maxDepth.

## Coverage

Validate the required Docs Map table. Discover explicitly mapped lifecycle docs,
read recognized labels and Rounds, check Flow backlinks including orphan mapped
documents. Warn about broken links, mirrored Status/Target drift, duplicate labels
and malformed index rows. Do not invent filename fallbacks for broken links.
The legacy `blueprints` kind remains readable as `blueprint` with a note.

Handoff verifies the active checkpoint and opted-in features. Active evidence is
checked against listed file hashes. Completed inactive features receive structural
historical checks only, with an explicit note: later code changes do not rewrite
old results. Re-select work in State before closing/retesting it. An honest FAIL or
NOT-RUN can support continuation, not completion.

## Supported syntax and bounds

ATX headings, bold opening labels, simple inline links and pipe tables. Machine
anchors remain fixed; prose may be Vietnamese or another language. Fenced examples,
HTML comments and indented code are excluded from declarations, tables and progress.
Opening labels are read from the top of the document up to the first level-2 or
deeper heading, not only the lines directly under the title. Pipe cells support
escaped pipes. Angle-wrapped destinations may contain spaces; encode literal
parentheses in a link path. Reference-style links, arbitrary raw HTML blocks,
setext headings and Markdown plugins are not machine anchors.

Directories recurse. Globs support *, ?, and whole-segment **. Brace/class/extglob
patterns are rejected. Paths normalize inside the project; encoded backslashes
cannot escape on Windows. Colons in paths are rejected for cross-platform safety.
All symlinks, including internal ones, are rejected. .git, node_modules and .venv
are not read as project records. Remote URLs are not followed.

Limits per mapped location: 10,000 matched Markdown files, 50,000 visited entries,
depth 64. Limit per file: 2 MiB. Crossing limits yields incomplete scan, exit 2,
never silent truncation. Use a trusted stationary checkout: checks do not sandbox
a malicious process replacing files concurrently.

Fingerprints hash raw file bytes exactly as stored on disk. A checkout that
converts line endings — `core.autocrlf=true` on Windows producing CRLF — changes
the bytes and makes recorded SHA-256 evidence read as stale. Pin LF endings in
`.gitattributes` (`* text=auto eol=lf`) for evidence-covered files rather than
normalizing inside the checker: a byte-exact fingerprint is the point.

## What a pass does not prove

This is not a proof of every prose MUST in the standard. Historical supersession,
real approval and permission require review. Normal checks run no product command,
Git command, deployment or recorded command. They write no doc, status or hash.
They cannot prove tests actually ran, coverage is complete, or a snapshot reached
a different machine. Unlisted dependencies/services may change despite matching
hashes. A stateless checker cannot prove that someone checked before clearing State.

Self-tests create and remove temporary fixtures. The teaching example includes an
intentional product failure; the regression suite asserts that expected failure.
It is not an accidentally broken checker or a completed product. Read the
[fresh-agent drill](HANDOFF-DRILL.md) before claiming real-agent portability.

## Separate staged gate - 2026-09-13

The staged gate uses the same reader and contracts over Git index objects. It
requires local Git supporting `--no-lazy-fetch` (verified here with Git 2.47.3).
The normal checker still needs no Git. The expanded self-test now requires Git
and invokes real commits only in disposable fixtures; CI's existing self-test step
includes these new regressions without requiring another workflow.

Only fixed read-only Git commands run: resolve the root/HEAD, enumerate index and
staged names, and read local blob sizes/bytes. No shell command from project prose,
checkout, content filter, model, network request or automatic staging is used.
Missing objects do not trigger lazy fetching. Dirty and untracked work is preserved.
Handoff selection and the exact checkpoint path come from staged FLOCK.md, not an
environment filename pattern. Active work requires a changed, staged checkpoint;
Core-only and idle work do not require synthetic checkpoint updates.

The API `checkStaged(repo, options)` adds `staged` diagnostics; `stagedExitCode`
returns 0 for selected checks passing, 1 for a contract/staging violation and 2
for usage/incomplete reads. Existing scan limits apply. Extra index bounds are
16 MiB metadata and 100,000 entries (`maxIndexBytes`, `maxIndexEntries` in the API).
Changed index/HEAD during validation fails; this remains a stationary-checkout
check, not a lock or transaction. Only the trusted gate's own backend is injected
via `options.fileSystem`; no filesystem implementation is loaded from a document.

Hashes compare exact staged blob bytes. Keep LF checkout rules consistent when
recording evidence from working files. A staged pass does not prove the working
tree passes, that any product tests ran, that every changed dependency was listed,
or that an earlier completion transition was verified. See [enforcement](ENFORCE.md).
