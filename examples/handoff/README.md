# Worked example: stopping an import feature midway through B2

This standalone teaching snapshot intentionally lacks duplicate-ID rejection.
One product test passes and one fails. The failure is honestly recorded; it is
exactly what a new agent should resume. No model, network or installation is used.

Treat this directory as the project root. Read AGENTS.md -> FLOCK.md -> docs/STATE.md.
From here run `node --test import.demo.test.mjs`: expect exit 1, one pass, one fail.
Do not weaken requirements or tests to hide the failure; implement duplicate
rejection. From the standard repository root, run:

```sh
node tools/check.mjs examples/handoff --handoff
```

Expect exit 0: unfinished work with honest evidence can be handed over, but is not
Done. The branch/base fields use not-a-git-repo for this exported teaching snapshot,
not for the containing standard repository. Replace them with observations when
adopting the example inside a real project. The worklog records an actual local
reproduction of the intentionally failing test, not a live-agent benchmark.

Practice only in a disposable copy. Fix B2, run the product checks, record real PASS
evidence and file hashes, close the round, then update canonical feature Status and
the roadmap mirror. Keep it selected in State through the final handoff check.
Use the [manual drill](../../docs/HANDOFF-DRILL.md) to test actual agents; automated
example checks alone do not prove that every agent will follow the instructions.
