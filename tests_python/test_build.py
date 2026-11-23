"""Smoke tests for the Python 3 build tool.

The build script is part of the documented workflow (`python build.py`), so it
needs a regression check alongside the JavaScript suite.
"""

import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from build import Build


class BuildToolTest(unittest.TestCase):
    def test_build_model_loads(self):
        builder = Build()
        self.assertIn('Visualizations', builder.build_model)
        self.assertIn('Graph', builder.build_model)
        self.assertIn('AreaChart', builder.build_model['Visualizations'])

    def test_default_bundle_is_non_empty(self):
        bundle = Build().build()
        self.assertGreater(len(bundle), 1000)
        self.assertTrue(bundle.startswith('(function () {'))
        self.assertIn('$jit.Graph = new Class', bundle)

    def test_single_visualization_build(self):
        bundle = Build().build(['AreaChart'])
        self.assertIn('$jit.AreaChart = new Class', bundle)

    def test_shared_dependency_is_included_once(self):
        bundle = Build().build(['AreaChart'])
        self.assertEqual(bundle.count('$jit.Graph = new Class'), 1)

    def test_unknown_visualization_is_ignored(self):
        bundle = Build().build(['NotAVisualization'])
        self.assertEqual(bundle, '(function () { \n\n\n\n })();')


if __name__ == '__main__':
    unittest.main()
