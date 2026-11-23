'use strict';

// The library predates CommonJS: each Source file populates the global `$jit`
// namespace. Load the real source files into one VM context with a minimal
// browser stub so the unit tests exercise shipped code, not a reimplementation.

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..', '..');

function loadSource(files) {
  const documentStub = {
    getElementById: () => null,
    createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }),
    getElementsByTagName: () => [],
    body: { appendChild() {} },
  };

  const sandbox = {
    console,
    document: documentStub,
    navigator: { userAgent: 'node-test' },
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
  };
  sandbox.window = { document: documentStub, addEventListener() {} };
  sandbox.globalThis = sandbox;

  const context = vm.createContext(sandbox);
  for (const file of files) {
    const absolute = path.resolve(ROOT, file);
    if (!absolute.startsWith(ROOT + path.sep)) {
      throw new Error(`Refusing to load source outside the repository: ${file}`);
    }
    vm.runInContext(fs.readFileSync(absolute, 'utf8'), context, {
      filename: file,
    });
  }
  return context;
}

module.exports = { loadSource, ROOT };
