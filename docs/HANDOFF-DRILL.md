# Fresh-agent handoff drill

Use a disposable example copy or non-production branch. Do not delete an active
working tree or expose real credentials. This is a manual acceptance procedure,
not a claim that live agents were benchmarked.

Agent A stops during B2 after meaningful partial work. Record the actual base,
unfinished edits, failing/unrun checks, next step and guardrails. Keep B2 unchecked.
Transfer the real code together with its docs.

Open agent B in a genuinely fresh session with no previous conversation:

```text
Continue from project files, not previous chat or private memory.
Read common instructions, FLOCK and the declared checkpoint.
Reconcile branch, commit, diff and verification before editing.
State active work, next action, constraints and unverified facts.
Continue approved scope. Preserve existing edits. Do not claim Done without current evidence.
```

| Case | Acceptance |
|---|---|
| Interrupted B2 | Finds the unfinished step without repeating recorded decisions |
| Known failing test | Works on the failure, does not claim Done |
| Code changed after PASS | Detects stale evidence and reruns checks, not just hashes |
| Roadmap disagrees with feature | Uses feature authority, repairs only the mirror with review |
| Rejected approach | Does not silently reverse approved decisions |
| Existing edits | Preserves and reconciles; never reset/clean |
| Other machine lacks code | Reports missing snapshot rather than inventing implementation |
| Different instruction filename | Reaches the common instructions through its actual entrypoint |

Repeat with the actual agents intended for use. Record versions, outcomes, repeated
questions, wrong-next-step incidents and false Done claims. Measure before claiming
token savings or universal portability. An interrupted session may lose facts never
saved anywhere; documents do not reconstruct those facts magically.

## Compare value rather than count files

Use representative tiny fixes, new behavior and interrupted handoffs. Compare
short instructions + code/tests with targeted Flock records; optionally test a
full-doc-context variant to expose unnecessary reading. Hold the starting commit,
model version, tools and task budget fixed. Give each variant the same approved
business facts (in a compact task packet or linked feature), not an easier scope.
Alternate run order and repeat tasks; record variability rather than one best run.

Measure total input/output tokens and elapsed work including document creation,
maintenance, retries, review and correction. Also record correct completion,
first useful action, repeated questions, reversed decisions and false Done claims.
A shorter first response is not evidence of a lower total cost.

Retain a document or process step only when its added information, risk reduction
or measured handoff value justifies its cost. Keep approval and safety boundaries
regardless of speed. Record agent versions and results before making comparative
claims; this procedure is not a report that such an experiment has been run.
