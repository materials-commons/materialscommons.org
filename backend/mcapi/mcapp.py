from flask import Flask, g, abort
from os import environ
import rethinkdb as r
from rethinkdb.errors import RqlDriverError
import mcexceptions
import traceback
import error

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
def required_attribute_exception_handler(e):
    print "Missing attribute: " + e.attr
    return error.not_acceptable("Missing required attribute: " + error.attr)

@app.errorhandler(RqlDriverError)
def database_exception_handler(e):
    return error.server_internal_error("Database connection failed")

@app.errorhandler(mcexceptions.AuthenticationException)
def authentication_exception_handler(e):
    return error.not_authorized("Authentication failed")

@app.errorhandler(mcexceptions.AccessNotAllowedException)
def access_not_allowed_exception_handler(e):
    return error.not_authorized("Access not allowed: " + e.id)

@app.errorhandler(mcexceptions.DatabaseError)
def database_error_exception_handler(e):
    return error.server_internal_error("Internal database error")

@app.errorhandler(mcexceptions.NoSuchItem)
def no_such_item_exception_handler(e):
    return error.bad_request("Unknown item: " + e.id)

@app.errorhandler(Exception)
def catchall_exception_handler(error):
    traceback.print_exc()
    return error.server_internal_error("Unknown server error")
