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

test('source files load and expose the $jit namespace', () => {
  const context = loadSource([
    'Source/Core/Core.js',
    'Source/Geometry/Complex.js',
    'Source/Graph/Graph.js',
  ]);
  assert.equal(typeof context.$jit.Graph, 'function');
  assert.equal(typeof context.Graph.Node, 'function');
  assert.equal(typeof context.Graph.Adjacence, 'function');
});

test('addNode stores a node and getNode returns it', () => {
  const graph = createGraph();
  const node = graph.addNode({ id: 'a', name: 'Alpha', data: { weight: 3 } });

  assert.equal(graph.hasNode('a'), true);
  assert.equal(graph.getNode('a'), node);
  assert.equal(graph.get('a'), node);
  assert.equal(node.name, 'Alpha');
  assert.equal(node.data.weight, 3);
});

test('addNode is idempotent for an existing id', () => {
  const graph = createGraph();
  const first = graph.addNode({ id: 'a', name: 'Alpha' });
  const second = graph.addNode({ id: 'a', name: 'Renamed' });

  assert.equal(second, first);
  assert.equal(second.name, 'Alpha');
  assert.deepEqual(Object.keys(graph.nodes), ['a']);
});

test('addAdjacence links nodes in both directions with shared data', () => {
  const graph = createGraph();
  graph.addNode({ id: 'a' });
  graph.addNode({ id: 'b' });
  const data = { $direction: ['a', 'b'] };

  const edge = graph.addAdjacence({ id: 'a' }, { id: 'b' }, data);

  assert.equal(graph.getAdjacence('a', 'b'), edge);
  assert.equal(graph.getAdjacence('b', 'a'), edge);
  assert.equal(graph.getNode('a').adjacentTo(graph.getNode('b')), true);
  assert.equal(graph.getNode('b').adjacentTo(graph.getNode('a')), true);
  assert.equal(edge.data, data);
});

test('addAdjacence creates missing endpoints', () => {
  const graph = createGraph();

  graph.addAdjacence({ id: 'a' }, { id: 'b' });

  assert.equal(graph.hasNode('a'), true);
  assert.equal(graph.hasNode('b'), true);
  assert.equal(graph.getAdjacence('a', 'b').data.$direction, undefined);
});

test('removeAdjacence clears both directions', () => {
  const graph = createGraph();
  graph.addAdjacence({ id: 'a' }, { id: 'b' });

  graph.removeAdjacence('a', 'b');

  assert.equal(graph.getAdjacence('a', 'b'), undefined);
  assert.equal(graph.getAdjacence('b', 'a'), undefined);
  assert.equal(graph.getNode('a').adjacentTo(graph.getNode('b')), false);
});

test('removeNode clears inbound edges and the node itself', () => {
  const graph = createGraph();
  graph.addAdjacence({ id: 'a' }, { id: 'b' });
  graph.addAdjacence({ id: 'c' }, { id: 'a' });

  graph.removeNode('a');

  assert.equal(graph.hasNode('a'), false);
  assert.equal(graph.getAdjacence('b', 'a'), undefined);
  assert.equal(graph.getAdjacence('c', 'a'), undefined);
  assert.equal(graph.getAdjacence('b', 'c'), undefined);
  assert.equal(graph.hasNode('b'), true);
  assert.equal(graph.hasNode('c'), true);
});

test('empty clears nodes and edges', () => {
  const graph = createGraph();
  graph.addAdjacence({ id: 'a' }, { id: 'b' });

  graph.empty();

  assert.deepEqual(Object.keys(graph.nodes), []);
  assert.deepEqual(Object.keys(graph.edges), []);
});
