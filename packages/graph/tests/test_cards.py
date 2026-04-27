import tempfile
import unittest
from pathlib import Path

from graph.cards import ingest_python_file


class TestCards(unittest.TestCase):
    def test_ingest_byte_ranges_cover_file(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            tmp = Path(td)
            f = tmp / "m.py"
            f.write_text("a\nbc\n", encoding="utf-8")
            cards = ingest_python_file(tmp, f)
            self.assertEqual(len(cards), 2)
            self.assertEqual(cards[0].char_start, 0)
            self.assertEqual(cards[0].char_end, len("a\n".encode()))
            self.assertEqual(cards[1].text, "bc")


if __name__ == "__main__":
    unittest.main()
