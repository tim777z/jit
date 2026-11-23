JavaScript InfoVis Toolkit
==========================

The JavaScript InfoVis Toolkit (JIT) provides tools for creating Interactive
Data Visualizations for the Web.

This is the development repository. Released bundles are available at
<http://thejit.org>.

Useful links
------------

- [JIT homepage](http://thejit.org)
- [JIT blog](http://blog.thejit.org)
- [Getting Started with the Source](https://github.com/philogb/jit/wiki/Getting-Started)

Architecture
------------

JIT is a browser library. The shipped artifact is a single self-contained
script, `Jit/jit.js`, with a minified companion `Jit/jit-yc.js`.

| Path | Purpose |
| --- | --- |
| `Source/` | Readable module sources, grouped by concern (`Core`, `Geometry`, `Graph`, `Layouts`, `Options`, `Visualizations`). This is what you edit. |
| `build.json` | Module dependency map used to concatenate the sources in dependency order. |
| `build.py` | Build tool that emits the combined bundle from `Source/` and `build.json`. |
| `Jit/` | Generated distribution files plus example assets. Do not hand-edit the bundles; regenerate them. |
| `Templates/`, `Tests/` | web.py templates and demo model data for the legacy example browser. `tests.py` holds demo data, **not** automated tests. |
| `webpy/` | Vendored, Python-2-era web.py framework used only by the legacy demo server. |
| `serve.py` | Legacy demo server (`python2 serve.py 8080`). |
| `Tests/*.test.js`, `Tests/helpers/` | Node.js automated test suite (see below); the other `Tests/` subdirectories are legacy demo fixtures. |
| `tests_python/` | Python smoke tests for the build tool. |

The library exposes one global namespace, `$jit`. `Source/Core/Core.js` defines
the class and utility primitives; `Source/Graph/Graph.js` implements the graph
data model that every visualization consumes.

Requirements
------------

- Node.js 20 or newer (see `.nvmrc`; CI uses that pin)
- Python 3.11 or newer for the build tool and its tests

The legacy `serve.py` demo server and `webpy/` bundle are Python 2 code and are
not part of the supported Node/Python 3 toolchain.

Install and test
----------------

```bash
npm ci          # reproducible install from package-lock.json
npm run lint    # ESLint on the automated test sources
npm test        # Node.js built-in test runner; exercises real Source/ files
```

The JavaScript suite loads the actual legacy source files into a sandbox, so
it covers shipped code rather than a reimplementation. Run it with
`node --test Tests` if you prefer not to use npm scripts.

Python build tooling:

```bash
python -m py_compile build.py make.py serve.py tests.py
python -m unittest discover -s tests_python -v
```

Build
-----

Regenerate the library bundle after editing `Source/`:

```bash
python build.py                       # all default visualizations
python build.py AreaChart Treemap     # a selected subset
```

The remaining `make.py` targets (`docs`, `examples`, `build`) also produce
generated artifacts but still rely on external tools (NaturalDocs,
YUI Compressor, zip) and, for `build`, the legacy Python-2 demo generators.

Docker
------

`docker compose up` serves the repository as static files on port 8080 using a
pinned nginx image with a read-only source mount. It does **not** run the
Python 2 demo server; generate static examples first with the `make.py`
targets. If Docker is unavailable in your environment, none of the build,
lint, or test commands require it.

Security notes
--------------

Visualization JSON is untrusted input. The graph model uses null-prototype
maps for node and edge indexes and rejects `__proto__` keys in copied data, so
attacker-controlled ids such as `toString` or `__proto__` cannot be confused
with real nodes or pollute `Object.prototype`. Inputs are validated at the
`Graph` boundary with `TypeError` for malformed node/edge objects.

Please report suspected vulnerabilities privately to the maintainers rather
than opening a public issue. Include a reproducer and affected version.

Contributing
------------

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow and the
checks CI enforces.
