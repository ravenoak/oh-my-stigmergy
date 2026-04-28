import unittest
from pathlib import Path

from graph.index import GraphIndex
from graph.ingest import extract_shell_sources, extract_typescript_imports, supported_suffix


class TestIngestMultilang(unittest.TestCase):
    def test_supported_suffix(self) -> None:
        self.assertTrue(supported_suffix(Path("x.ts")))
        self.assertTrue(supported_suffix(Path("x.tsx")))
        self.assertFalse(supported_suffix(Path("x.go")))

    def test_ts_import_regex(self) -> None:
        src = 'import { z } from "./deps";\n'
        self.assertIn("deps", extract_typescript_imports(src))

    def test_shell_source_regex(self) -> None:
        src = "source ./common.sh\n"
        self.assertEqual(extract_shell_sources(src), ["./common.sh"])

    def test_fixture_corpus_index(self) -> None:
        root = Path(__file__).resolve().parents[3] / "tests" / "fixtures" / "graph-corpus"
        idx = GraphIndex.build(root, globs=("**/*.py", "**/*.ts", "**/*.sh"))
        langs = {c.language for c in idx.cards.values()}
        self.assertIn("python", langs)
        self.assertIn("typescript", langs)
        self.assertIn("shell", langs)
        kinds = {e[2] for e in idx.edges}
        self.assertIn("IMPORTS", kinds)
        self.assertIn("SOURCES", kinds)
        self.assertIn("CALLS", kinds)
        sym = [c for c in idx.cards.values() if c.language == "typescript" and c.role == "symbol"]
        self.assertTrue(any("helper" in c.text for c in sym), "expected Tree-sitter TS symbol for helper()")


if __name__ == "__main__":
    unittest.main()
