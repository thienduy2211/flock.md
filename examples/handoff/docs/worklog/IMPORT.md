# Import outcomes

**Feature:** [Approved behavior](../feature/IMPORT.md)
**Blueprint:** [Rounds](../blueprint/IMPORT.md)

## Checkpoint B2

This fictional scenario stops after B1, before duplicate rejection is implemented.
No requirement was changed to justify the failure. B2 remains unchecked. The actual
next action is owned by STATE.md, not a second mutable task list here.

## Verification B2

**Result:** FAIL
**Checks:** node --test import.demo.test.mjs from the example root; exit 1, B1 passes, B2 fails with Missing expected exception.
**Checked:** 2026-09-10T02:17:21+00:00
**Code ref:** example-working-tree
**Acceptance:** NOT-REQUIRED

Actual local reproduction on Node 22.16.0/Linux of this deliberately unfinished
teaching scenario. This is not a live-agent session or a production project.

| File | SHA256 |
|---|---|
| [Source](../../src/import.mjs) | bd733ca10bb878d457126ee559c1f3630c1ced47f24c56dc0ac447daed9f9511 |
| [Test](../../import.demo.test.mjs) | dc9168aad9f0207f42791a72681bd381b67f8f7604eb07632a1208d848114664 |
