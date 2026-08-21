# B06 — validator self-test

Evidence that `validation/check.mjs` discriminates between a complete
cross-layer migration and one that stops at five of six layers. Produced during
benchmark construction, before any experiment. **No model was invoked**: the
mutants are deterministic textual patches applied by the benchmark author.

The reference implementation is **not published**. Only the verdicts are
recorded here.

## Method

For each row, the frozen seed tree was copied, the version 2 work was applied
to a subset of the six layers of `TASK.md` §7, and the frozen commands were run
unchanged:

```
npx tsc -b            # typecheck + build
node validation/check.mjs
```

The validator reports 80 checks in seven groups: `environment`, `parser`,
`migration`, `serializer`, `api`, `client`, `cli`.

## Results

| Layers implemented | Build | Verdict | Checks passed | Failing groups |
| --- | :---: | --- | ---: | --- |
| none (frozen seed) | 0 | **FAIL** | 24/80 | parser, serializer, migration, api, client, cli |
| all six | 0 | **PASS** | 80/80 | — |
| all but `parser` | 0 | **FAIL** | 44/80 | parser, serializer, migration, api, client, cli |
| all but `serializer` | 0 | **FAIL** | 53/80 | serializer, api, client, cli |
| all but `migration` | 0 | **FAIL** | 46/80 | migration, serializer, api, client, cli |
| all but `api` | 0 | **FAIL** | 68/80 | api, client, cli |
| all but `client` | 0 | **FAIL** | 74/80 | client, cli |
| all but `cli` | 0 | **FAIL** | 77/80 | cli |

## What this shows

- The frozen seed builds, typechecks and passes its own 24-test suite, and
  still fails external validation for six independent reasons.
- **Every** five-of-six combination fails. The narrowest case, "everything
  except the CLI", still fails three checks — the intended
  `worker fixed 5 of 6 layers` failure mode is detected rather than absorbed.
- Each omitted layer always appears among the failing groups, so the validation
  summary names which layer was left behind.
- Only the complete migration passes.

## Frozen-seed baseline

```
npm run typecheck   -> exit 0
npm run build       -> exit 0
npm test            -> 24 tests, 24 pass
npm run check       -> exit 1, 24/80
```
