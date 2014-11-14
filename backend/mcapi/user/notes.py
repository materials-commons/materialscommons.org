from ..mcapp import app
from ..decorators import jsonp, apikey
import rethinkdb as r
from flask import g, request, jsonify
from .. import dmutil
from loader.model import note

@app.route('/notes/<project_id>', methods=['GET'])
@jsonp
def get_notes(project_id):
    all = dict()
    rr = list(r.table('notes').get_all(project_id, index='project_id')
              .run(g.conn))
    all['notes'] = rr
    return dmutil.jsoner(all)


@app.route('/notes', methods=['POST'])
@apikey(shared=True)
def add_note():
    j = request.get_json()
    item_id = dmutil.get_required('item_id', j)
    item_type = dmutil.get_required('item_type', j)
    creator = dmutil.get_required('creator', j)
    title = dmutil.get_required('title', j)
    message = dmutil.get_required('note', j)
    project_id = dmutil.get_required('project_id', j)
    n = note.Note(creator, message, title, item_id, item_type, project_id)
    rv = dmutil.insert_entry('notes', n.__dict__, return_created=True)
    return dmutil.jsoner(rv)


@app.route('/notes', methods=['PUT'])
@apikey(shared=True)
@jsonp
def update_note():
    j = request.get_json()
    title = dmutil.get_optional('title', j)
    message = dmutil.get_optional('note', j)
    note_id = dmutil.get_required('id', j)
    if message or title:
        rv = r.table('notes').get(note_id).update({'title': title,
                                                   'note': message,
                                                   'mtime': r.now()})\
            .run(g.conn)
        return jsonify(rv)