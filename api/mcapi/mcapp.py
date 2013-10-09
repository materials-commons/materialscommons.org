from flask import Flask, g, abort
from os import environ
import rethinkdb as r
from rethinkdb.errors import RqlDriverError
import mcexceptions

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

@app.errorhandler(mcexceptions.RequiredAttributeException)
def required_attribute_exception_handler(error):
    return "Missing required attribute", 406

@app.errorhandler(RqlDriverError)
def database_exception_handler(error):
    return "Database connection failed", 500

@app.errorhandler(mcexceptions.AuthenticationException)
def authentication_exception_handler(error):
    return "Authentication failed", 401

@app.errorhandler(mcexceptions.AccessNotAllowedException)
def access_not_allowed_exception_handler(error):
    return "Access not allowed", 401

@app.errorhandler(Exception)
def catchall_exception_handler(error):
    return "Unknown server error", 500
