# Import implementation

**Feature:** [Approved behavior](../feature/IMPORT.md)

## Current state (measured)

src/import.mjs trims fields. The duplicate-ID test fails. This is an implementation
gap, not a reason to revise the approved requirement.

## Rounds

- [x] B1 - normalize fields
- [ ] B2 - reject duplicate IDs

### B1 - normalize fields

Implemented trimming; its product test passes.

### B2 - reject duplicate IDs

Detect duplicate normalized IDs in src/import.mjs. Preserve input and order.
Run node --test import.demo.test.mjs from this example's root. Record results before
checking this round. Do not remove or weaken the duplicate test.

## Guardrails

An isolated teaching fixture: no database, deployment or external service.
