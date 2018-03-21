import json

from flask import Flask, request, g

from DB import DbConnection
from api_key import apikey

app = Flask(__name__.split('.')[0])


def format_as_json_return(what):
    if 'format' in request.args:
        return json.dumps(what, indent=4)
    else:
        return json.dumps(what)


@app.before_request
def before_request():
    DbConnection().set_connection()


@app.teardown_request
def teardown_request(exception):
    DbConnection().close_connection()
    if exception:
        pass


@app.route('/')
def hello_world():
    return format_as_json_return({"hello": "world"})


@app.route('/test')
@apikey
def setup_test():
    return {
        "url": g.python_api_remote.config.mcurl,
        "apikey": g.python_api_remote.config.mcapikey
    }


from materials_commons.api import _Config as Config
from materials_commons.api import _Remote as Remote


def set_global_python_api_remote(apikey):
    config = Config(override_config={
        "apikey": apikey,
        "mcurl": "http://mcdev.localhost/api"
    })
    remote = Remote(config=config)
    g.python_api_remote = remote
