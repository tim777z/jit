# Contributing

## Development workflow

1. Install with `npm ci` so everyone uses the exact locked dependency tree.
2. Edit module sources under `Source/`, not the generated bundles in `Jit/`.
3. Add or update tests under `Tests/` (Node.js) or `tests_python/` (build tool).
4. Regenerate `Jit/jit.js` with `python build.py` when library sources change.
5. Run all checks locally before opening a pull request.

## Required checks

CI runs the following and a PR is expected to pass all of them:

| Command | What it verifies |
| --- | --- |
| `npm run lint` | ESLint on the automated test sources (`.eslintrc.json`). |
| `npm audit --audit-level=high` | No high/critical vulnerabilities in locked dependencies. |
| `npm test` | Node.js test suite against the real `Source/` files. |
| `python -m py_compile build.py make.py serve.py tests.py` | Build tooling parses on Python 3. |
| `python -m unittest discover -s tests_python -v` | Build tool smoke tests. |

Node is pinned by `.nvmrc`; CI uses `node-version-file` so local and CI runs
agree. Use `npm ci --ignore-scripts` for a supply-chain-minimal install.

## Test conventions

- Node tests use the built-in `node:test` runner and `node:assert/strict`.
  No external test framework dependency is required.
- `Tests/helpers/load-source.js` loads legacy browser sources into a VM with a
  small DOM stub. Prefer extending that harness over duplicating logic.
- The directories `Tests/AreaChart/`, `Tests/Other/`, and similar are legacy
  demo fixtures, not automated tests. Do not add assertions there; ESLint is
  intentionally scoped to `Tests/*.test.js` and `Tests/helpers/*.js`.
- Use the exact tracked casing `Tests/` in scripts and docs: `tests/` is a
  different path on the case-sensitive Linux runner used by CI.
- Assertion helpers that compare objects created inside the VM should compare
  names or values rather than host-realm constructors, because the VM has its
  own `Object` and `TypeError`.

## Security

Treat visualization data as untrusted. Node/edge ids, option objects, and any
JSON parsed from a request can reach the graph model. Preserve the
prototype-pollution defenses in `Source/Core/Core.js`, `Source/Core/Fx.js` and
`Source/Graph/Graph.js`, and add a regression test when touching those paths.

Do not commit secrets, credentials, or generated lockfile overrides. Report
suspected vulnerabilities privately to the maintainers with a reproducer.
