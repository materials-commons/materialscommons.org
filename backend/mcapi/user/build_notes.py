import rethinkdb as r
from flask import g
from .. import dmutil, resp
from loader.model import note


def construct_notes(j):
    owner = dmutil.get_required('owner', j)
    title = dmutil.get_required('title', j)
    text = dmutil.get_required('note', j)
    project_id = dmutil.get_required('project_id', j)
    #n = note.Note(owner, text, title, project_id)
    n = {}
    n['owner'] = owner
    n['title'] = title
    n['note'] = text
    n['project_id'] = project_id
    return n


def update_join(n, n2item):
    result = r.table('notes').get(n2item[0]['note_id']).update(
            {
                'note': n['note'],
                'title': n['title'],
                'mtime': r.now()
            },return_changes=True).run(g.conn, time_format='raw')
    updated_note = result['changes'][0]['new_val']
    return resp.to_json(updated_note)


def does_join_exists(item_id):
    return list(r.table('note2item').get_all(item_id, index='item_id')\
                .run(g.conn))
