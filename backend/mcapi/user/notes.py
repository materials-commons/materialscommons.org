from ..mcapp import app
from ..decorators import jsonp, apikey
import rethinkdb as r
from flask import g, request
from .. import dmutil, error, resp
from loader.model import note


@app.route('/notes/<project_id>', methods=['GET'])
@jsonp
def get_notes(project_id):
    notes = list(r.table('notes')
                 .get_all(project_id, index='project_id')
                 .run(g.conn))
    return resp.to_json(notes)


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
    created_note = dmutil.insert_entry('notes', n.__dict__,
                                       return_created=True)
    return resp.to_json(created_note)


@app.route('/notes', methods=['PUT'])
@apikey(shared=True)
@jsonp
def update_note():
    j = request.get_json()
    title = dmutil.get_optional('title', j)
    message = dmutil.get_optional('note', j)
    note_id = dmutil.get_required('id', j)
    if message or title:
        r.table('notes').get(note_id).update({'title': title, 'note': message,
                                              'mtime': r.now()}).run(g.conn)
        updated_note = dmutil.get_single_from_table('notes', note_id)
        return updated_note
    else:
        return error.not_acceptable("Unable to update note: " + note_id)
