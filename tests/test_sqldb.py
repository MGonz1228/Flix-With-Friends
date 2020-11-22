import unittest

from sqldb import SqlDb


INPUT = 'input'
OUTPUT = 'output'

URI_TO_DSN_SUCCESS = [
    {
        INPUT: 'postgresql://username:password@localhost:5432/dbname?connect_timeout=10',
        OUTPUT: 'connect_timeout=10 dbname=dbname host=localhost password=password port=5432 user=username'
    },
    {
        INPUT: 'postgresql://username@localhost/dbname',
        OUTPUT: 'dbname=dbname host=localhost user=username'
    },
    {
        INPUT: 'postgres://username@localhost/dbname',
        OUTPUT: 'dbname=dbname host=localhost user=username'
    },
    {
        INPUT: 'postgresql://localhost/dbname',
        OUTPUT: 'dbname=dbname host=localhost'
    },
    {
        INPUT: 'postgresql:///dbname?host=localhost',
        OUTPUT: 'dbname=dbname host=localhost'
    },
]

URI_TO_DSN_FAIL = [
    'user=username password=password host=localhost port=5432 dbname=dbname',
    'username:password@localhost:5432/dbname?param=abc',
    'postgresql://2user:password@localhost:5432/dbname?connect_timeout=10',
    'postgresql://localhost:54a32',
    'postgresql://localhost:65536',
]

class SqldbTest(unittest.TestCase):
    def test_uri_to_dsn_success(self):
        for entry in URI_TO_DSN_SUCCESS:
            self.assertEqual(SqlDb.uri_to_dsn(entry[INPUT], sortkeys=True), entry[OUTPUT])

    def test_uri_to_dsn_fail(self):
        for uri in URI_TO_DSN_FAIL:
            self.assertIsNone(SqlDb.uri_to_dsn(uri))
