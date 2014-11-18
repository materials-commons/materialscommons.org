import json
import flask


def to_json(what):
    return flask.Response(json.dumps(what), mimetype="application/json")


def to_json_id(id):
    return flask.Response(json.dumps({'id': id}), mimetype="application/json")
