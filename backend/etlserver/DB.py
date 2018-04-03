from os import environ
from flask import g, abort
import rethinkdb as r
from rethinkdb.errors import RqlDriverError, ReqlError

_MCDB = "materialscommons"
_MCDB_HOST = environ.get('MCDB_HOST') or 'localhost'
_MCDB_PORT = environ.get('MCDB_PORT') or 28015


class DbConnection:
    def __init__(self):
        pass

    @staticmethod
    def set_connection():
        try:
            if 'conn' not in g or not g.conn:
                g.conn = r.connect(host=_MCDB_HOST, port=_MCDB_PORT, db=_MCDB)
        except RqlDriverError:
            abort(503, "Database connection could not be established")

    def connection(self):
        if 'conn' not in g or not g.conn:
            self.set_connection()
        ret_value = None
        if 'conn' in g and g.conn:
            ret_value = g.conn
        return ret_value

    @staticmethod
    def interface():
        return r

    @staticmethod
    def close_connection():
        try:
            if 'conn' in g and g.conn:
                g.conn.close()
        except ReqlError:
            pass
        g.conn = None
