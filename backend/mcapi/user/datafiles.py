from ..mcapp import app
from ..decorators import apikey
from flask import g, request
import rethinkdb as r
from .. import error
from .. import access
from .. import resp
from .. import dmutil
from loader.model import note
from loader.model import note2item



@app.route('/datafile/<datafileid>', methods=['GET'])
@apikey(shared=True)
def datafile_for_user_by_id(datafileid):
    user = access.get_user()
    rr = r.table('datafiles').get(datafileid)
    df = rr.run(g.conn, time_format='raw')
    if df is None:
        return error.bad_request("No such datafile: %s" % (datafileid))
    access.check(user, df['owner'], df['id'])
    tags = list(r.table('tag2item')
                .get_all(datafileid, index='item_id')
                .filter({'user': user})
                .pluck('tag').run(g.conn))
    # Strip tag key
    df['tags'] = [t['tag'] for t in tags]
    return resp.to_json(df)


@app.route("/datafile/<datafile_id>", methods=['PUT'])
@apikey
def update_datafile(datafile_id):
    user = access.get_user()
    j = request.get_json()
    df = r.table("datafiles").get(datafile_id).run(g.conn)
    if df is None:
        return error.bad_request("No such datafile: %s" % (datafile_id))
    access.check(user, df['owner'], df['id'])
    tag_id = dmutil.get_optional("tag_id", j, None)
    if tag_id is not None:
        # make sure tag exists
        tag = r.table("tags").get(tag_id).run(g.conn)
        if tag is None:
            return error.bad_request("No such tag: %s" % (tag_id))
        # Make sure file isn't already tagged with this tag
        tags = list(r.table("tag2item")
                    .get_all(df['id'], index="item_id")
                    .filter({"tag_id": tag_id})
                    .run(g.conn))
        if tags:
            return resp.to_json(df)

        r.table("tag2item").insert({
            "tag_id": tag_id,
            "tag_name": tag['name'],
            "item_id": df['id'],
            "item_name": df['name'],
            "item_type": "datafile"
        }).run(g.conn)
        return resp.to_json(df)


@app.route("/datafile/<datafile_id>/note", methods=['PUT'])
@apikey()
def update_datafile_note(datafile_id):
    j = request.get_json()
    owner = dmutil.get_required('owner', j)
    title = dmutil.get_required('title', j)
    note_msg = dmutil.get_required('note', j)
    project_id = dmutil.get_required('project_id', j)
    n = note.Note(owner, note, title, project_id)
    note2item_join = list(r.table('note2item').get_all(datafile_id, index='item_id')\
        .run(g.conn))
    if note2item_join:
        print 'join'
        result = r.table('notes').get(note2item_join[0]['note_id']).update(
            {'note': note_msg, 'title': title, 'mtime': r.now()
            },return_changes=True).run(g.conn)
        updated_note = result['changes'][0]['new_val']
        return resp.to_json(updated_note)
    else:
        print 'new'
        created_note = dmutil.insert_entry('notes', n.__dict__,
                                       return_created=True)
        n2item = note2item.Note2Item(datafile_id, 'datafile', created_note['id'])
        dmutil.insert_entry('note2item', n2item.__dict__)
        return resp.to_json(created_note)