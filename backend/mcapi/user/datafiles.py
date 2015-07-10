from ..mcapp import app
from ..decorators import apikey, jsonp
from flask import g, request
import rethinkdb as r
from .. import error
from .. import access
from .. import resp
from .. import dmutil
from loader.model import note
from loader.model import note2item
from build_notes import construct_notes, update_join, does_join_exists



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


@app.route("/datafile/<datafile_id>/tags/notes", methods=['GET'])
@jsonp
def get_tags_notes(datafile_id):
    tags_notes = list(r.table('datafile').get_all(datafile_id).merge(lambda datafile:
        {
            'tags': r.table('tag2item').get_all(datafile_id, index='item_id')
            .coerce_to('array'),
            'notes': r.table('note2item').get_all(datafile_id, index='item_id')
            .eq_join('note_id', r.table('notes'))
            .coerce_to('array')
        }.run(g.conn, time_format="raw")))
    return resp.to_json(tags_notes)

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
    n = construct_notes(j)
    n2item = does_join_exists(datafile_id)
    if n2item:
        return update_join(n, n2item)
    else:
        new_note = dmutil.insert_entry('notes', n,
                                       return_created=True)
        n2item = note2item.Note2Item(datafile_id, 'datafile', new_note['id'])
        dmutil.insert_entry('note2item', n2item.__dict__)
        return resp.to_json(new_note)
