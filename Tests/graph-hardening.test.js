'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { loadSource } = require('./helpers/load-source');

function createGraph() {
  const context = loadSource([
    'Source/Core/Core.js',
    'Source/Geometry/Complex.js',
    'Source/Graph/Graph.js',
  ]);
  return new context.$jit.Graph(
    {},
    context.Graph.Node,
    context.Graph.Adjacence,
    {}
  );
}

test('inherited Object.prototype keys are not reported as nodes', () => {
  const graph = createGraph();

  assert.equal(graph.hasNode('toString'), false);
  assert.equal(graph.hasNode('constructor'), false);
  assert.equal(graph.hasNode('__proto__'), false);
  assert.equal(graph.getNode('toString'), undefined);
});

test('a "__proto__" node id creates a real node without polluting Object.prototype', () => {
  const graph = createGraph();

  const node = graph.addNode({ id: '__proto__', name: 'Poison' });

  assert.equal(typeof node, 'object');
  assert.equal(node.name, 'Poison');
  assert.equal(graph.getNode('__proto__'), node);
  assert.equal(Object.prototype.name, undefined);
  assert.equal({}.name, undefined);
});

test('a "constructor" node id is an ordinary graph node', () => {
  const graph = createGraph();

  const node = graph.addNode({ id: 'constructor', name: 'Node' });

  assert.equal(node.name, 'Node');
  assert.equal(graph.get('constructor'), node);
  assert.notEqual(node, Object);
});

test('untrusted node data cannot set a prototype through __proto__', () => {
  const graph = createGraph();
  const data = JSON.parse('{"__proto__":{"polluted":"yes"},"$width":10}');

  const node = graph.addNode({ id: 'a', data });

  assert.equal(node.data.$width, 10);
  assert.equal(node.data.polluted, undefined);
  assert.equal(Object.prototype.polluted, undefined);
  assert.equal({}.polluted, undefined);
});

test('removeAdjacence reports missing endpoints instead of throwing', () => {
  const graph = createGraph();
  graph.addAdjacence({ id: 'a' }, { id: 'b' });

  assert.equal(graph.removeAdjacence('a', 'missing'), false);
  assert.equal(graph.removeAdjacence('missing', 'b'), false);
  assert.equal(graph.hasNode('a'), true);
  assert.equal(Object.keys(graph.getAdjacence('a', 'b').data).length, 0);
});

test('addNode and addAdjacence reject malformed input with a TypeError', () => {
  const graph = createGraph();

  // Errors are constructed inside the VM, so compare by name rather than
  // by host-realm constructor identity.
  assert.throws(() => graph.addNode({}), { name: 'TypeError' });
  assert.throws(() => graph.addNode(null), { name: 'TypeError' });
  assert.throws(() => graph.addAdjacence({ id: 'a' }, {}), { name: 'TypeError' });
});
