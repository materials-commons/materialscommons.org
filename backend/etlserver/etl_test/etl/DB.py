from os import environ
import logging
import rethinkdb as r
from rethinkdb.errors import RqlDriverError, ReqlError

_MCDB = "materialscommons"
_MCDB_HOST = environ.get('MCDB_HOST') or 'localhost'
probe = environ.get('MCDB_PORT')
if not probe:
    print("Unable to run without a setting for MCDB_PORT")
    exit(-1)
_MCDB_PORT = int(environ.get('MCDB_PORT'))


class DbConnection:
    def __init__(self):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.conn = None

    def set_connection(self):
        try:
            if not self.conn:
                self.conn = r.connect(host=_MCDB_HOST, port=_MCDB_PORT, db=_MCDB)
        except RqlDriverError as excp:
            self.conn = None
            message = "Database connection could not be established: host, port, db = " + \
                      _MCDB_HOST + ", " + str(_MCDB_PORT) + ", " + _MCDB
            self.log.error(message)
            raise excp

    def connection(self):
        if not self.conn:
            self.set_connection()
        ret_value = None
        if self.conn:
            ret_value = self.conn
        return ret_value

    @staticmethod
    def interface():
        return r

    def close_connection(self):
        try:
            if self.conn:
                self.conn.close()
        except ReqlError:
            pass
        self.conn = None
