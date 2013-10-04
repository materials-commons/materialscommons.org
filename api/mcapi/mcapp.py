from flask import Flask, g, abort
from os import environ
import rethinkdb as r
from rethinkdb.errors import RqlDriverError

app = Flask(__name__.split('.')[0])

_MCDB = "materialscommons"
_MCDB_HOST = environ.get('MCDB_HOST') or 'localhost'
_MCDB_PORT = environ.get('MCDB_PORT') or 28015

def mcdb_connect():
    return r.connect(host=_MCDB_HOST, port=_MCDB_PORT, db=_MCDB)

@app.before_request
def before_request():
    try:
        g.conn = mcdb_connect()
    except RqlDriverError:
        abort(503, "Database connection could not be established")

@app.teardown_request
def teardown_request(exception):
    try:
        g.conn.close()
    except:
        pass
