# The 5-Whys Framework for Engineering Lessons Learned

> Systematic methodology to uncover the foundational design or mental-model flaw behind software incidents and bugs, ensuring lessons prevent entire classes of failures.

---

## 1. Why 5-Whys Matters

Superficial fixes address only the immediate symptom:
* *Symptom fix:* "We added a null check on `user.profile.settings`."
* *Result:* Two weeks later, another unhandled undefined error crashes the system in another file.

5-Whys digs through layers of causation until an architectural invariant or process guardrail is reached:
1. **Level 1 (Symptom):** What crashed? (Null pointer exception).
2. **Level 2 (Trigger):** Why was it null? (API returned a payload missing the `profile` object).
3. **Level 3 (Contract):** Why was the API payload missing it? (Database migration set column to NULL for legacy rows).
4. **Level 4 (Validation):** Why did client code assume it was non-null? (TypeScript types were generated manually instead of derived from OpenAPI/Zod schema).
5. **Level 5 (Foundational Flaw):** Why was schema validation missing at the boundary? (Lack of boundary parsing pattern; trusting untyped external inputs).

**True Resolution:** Introduce Zod runtime validation at HTTP boundaries and derive TypeScript types directly from schemas. This eliminates null pointer exceptions permanently across the entire codebase.

---

## 2. The 4-Part Structure of a Self-Defined Problem

When logging a lesson learned with this skill, adhere to the 4-part structure:

### Part 1: Symptom & Error Signature
* Precise exception name or machine error code (e.g. `ERR_POOL_EXHAUSTED_CONCURRENCY`, `DEADLOCK_DETECTED`).
* Verbatim error logs or code snippet that triggered the failure.

### Part 2: 5-Whys Root Cause
* Trace the causation chain from the terminal symptom down to the foundational mental model error.
* Identify the false assumption (e.g., "Assumed Redis keys never expire during read", "Assumed async event loops scale infinitely without backpressure").

### Part 3: Verified Remediation & Code Diff
* Clear Before / After code snippet.
* Explanatory comments detailing why the new implementation is resilient.

### Part 4: Personal Takeaway & Guardrail
* **Guardrail:** Automated check (lint rule, test assertion, circuit breaker, CI gate).
* **Mental Model Shift:** A 1-2 sentence engineering heuristic to carry forward into future system designs.
