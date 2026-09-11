# <Name> - Worklog

**Feature:** [<NAME>.md](../feature/<NAME>.md)
**Blueprint:** [<NAME>_BLUEPRINT.md](../blueprint/<NAME>_BLUEPRINT.md)

Append significant outcomes, including checkpoints within unfinished rounds.
Do not wait for the whole round. Do not paste chat history. Replace placeholders.

## Checkpoint B1 - <YYYY-MM-DD>

**Did:** <specific files and actual commit/snapshot reference>
**Deviations:** <plan said X; did Y because Z; or none>
**Decisions:** <dated decisions, authorization and rejected alternatives>
**Remaining:** <unfinished work; the current next action belongs in the state file>

## Verification B1

**Result:** NOT-RUN
**Checks:** <exact commands/procedures, observed outcome and uncovered criteria>
**Checked:** <ISO timestamp with timezone; do not invent a test time>
**Code ref:** <actual commit or snapshot identity>
**Acceptance:** PENDING

<For PASS, fingerprint relevant code/tests/config after running checks. For FAIL or
NOT-RUN, explain why; do not declare Done. NOT-REQUIRED acceptance is allowed only
when approved criteria require no separate human review. Name required reviewers.
Keep old evidence intact. Re-select completed work to assess it against current code.>

| File | SHA256 |
|---|---|
| <relative path to a verified file> | <actual SHA-256; never hash this worklog itself> |
