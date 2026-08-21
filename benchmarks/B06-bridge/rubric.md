# B6 — Rubric (FROZEN)

Total: 100 points. Scored blind on `Candidate X` / `Candidate Y`.
Frozen before any run. Any change after outputs are observed makes the battery
`RUN_INVALID`.

There is no visual component. Evidence used by the evaluator, per candidate:

- the candidate source tree;
- `patch.diff` against the frozen seed;
- the sanitised external validation summary (`validation/check.mjs` report,
  which is grouped by layer);
- the candidate's test suite.

| # | Criterion                | Weight |
| - | ------------------------ | ------ |
| 1 | Correctness              | 50     |
| 2 | Backward compatibility   | 20     |
| 3 | Migration / Idempotency  | 15     |
| 4 | Cross-layer completeness | 10     |
| 5 | Code                     | 5      |

## 1. Correctness — 50

Version 2 works: parsing with the declared defaults, the constraints of
`TASK.md` §3, the error contract of §6, canonical serialization of §5, and the
per-layer behaviour of §8.

- **45-50** — Everything in §3, §5, §6 and §8 holds. Canonical text is
  byte-exact in the declared key order. Defaults are applied independently of
  each other. Every error code **and** path matches, for both versions.
  Unknown top-level keys land in `extensions` and never remain at the top
  level. External validation passes on the first attempt.
- **35-44** — External validation passes, with one contract detail weaker than
  specified: a default applied only when a sibling is present, an error path
  that is right in one version and generic in the other, an `extensions` merge
  that resolves a conflict the other way, or serialization that is correct but
  produced by a route the TASK did not describe.
- **25-34** — Passes only after the single allowed repair, or one of the four
  areas (§3, §5, §6, §8) has a visible gap that the validator happened not to
  reach.
- **12-24** — A layer produces wrong values, or the error contract is
  approximated (message shape or code chosen ad hoc).
- **1-11** — Version 2 works in isolated spots only.
- **0** — External validation does not pass.

**Caps.** Any of the following caps this criterion at 15 points:

- special-casing the validator (recognising its fixtures, ids or call order);
- hardcoding an expected output instead of deriving it;
- editing `validation/`, a `tsconfig*.json` or a `package.json` to make a check
  pass;
- adding, removing or vendoring a dependency.

## 2. Backward compatibility — 20

Everything `TASK.md` §9 freezes must still hold.

- **18-20** — Every version 1 path is untouched in behaviour: parsing,
  canonical version 1 serialization including extension keys and omitted
  optionals, the client reading version 2 paths off a version 1 document,
  `bridge set` on a version 1 file still emitting a version 1 document, and
  every version 1 error code and path.
- **14-17** — Preserved, with one incidental change a caller could notice: a
  reordered key in an unrelated position, a reworded message body behind an
  unchanged code, a stricter-than-before acceptance of an odd but previously
  valid document.
- **8-13** — A version 1 behaviour changed: an optional field now emitted, an
  extension key relocated, or `set` on a version 1 file now producing version 2.
- **3-7** — Version 1 documents are silently upgraded, or version 1 errors
  changed code.
- **0** — Version 1 stopped working.

Migrating a document that the caller did not ask to migrate is a
backward-compatibility failure, not a feature.

## 3. Migration / Idempotency — 15

The mapping table of `TASK.md` §4.

- **14-15** — Every row of the table exact, including `backoff` derived from
  `max_attempts`, `cache.ttl_seconds` derived from `cache.enabled`, `notify`
  order preserved, and extensions carried with values unchanged. Idempotent for
  every input. Does not mutate its argument. Defined once and reused by every
  layer.
- **11-13** — Table exact and idempotent, but the mapping is expressed in more
  than one place, or migration mutates its input.
- **6-10** — One row wrong or one default missing; or idempotency holds for the
  tested documents but not by construction.
- **2-5** — Several rows wrong, or migrating twice changes the document.
- **0** — No usable migration.

## 4. Cross-layer completeness — 10

The validator groups its checks by layer: `parser`, `serializer`, `migration`,
`api`, `client`, `cli`. This criterion is about all six being carried, and
being carried coherently.

- **9-10** — All six layers implement version 2, and they agree: the API body,
  the CLI output and the serializer produce identical bytes for the same
  document; the client's values equal the migration's values; the service
  policy and the parser accept the same version set.
- **6-8** — All six work, but one duplicates a rule that belongs in `core`
  (its own key order, its own defaults, its own version list) instead of
  delegating.
- **3-5** — Five of the six layers carry version 2; one is stale.
- **1-2** — Two or more layers stale.
- **0** — Only `core` was touched.

A divergence between two layers that serialize the same document — different
key order, different rounding, different rendering of a value — scores at most
5 here even when every layer "works".

## 5. Code — 5

- **5** — Types express the contract rather than restating it (`ConfigV1`,
  `ConfigV2`, discriminated on `version`); no `any`; no duplicated mapping
  table; tests added for version 2 across the layers; no dead code.
- **3-4** — Reasonable; some duplication or a shallow test layer.
- **1-2** — `any` used to get past the compiler, or a copy-pasted mapping.
- **0** — Unreadable, or the type system disabled to make it build.
