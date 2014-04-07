import unittest
from ud import ProvenanceSaver, StateCreateSaver


class TestProvenanceSaver(unittest.TestCase):
    def setUp(self):
        self.p = ProvenanceSaver("abc123", "test@mc.org")

    def test_1(self):
        print "test_1"


class TestStateCreateSaver(unittest.TestCase):
    def setUp(self):
        self.saver = StateCreateSaver()

    def test_2(self):
        print "test_2"

if __name__ == '__main__':
    unittest.main()
