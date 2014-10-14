from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp
import rethinkdb as r
from flask import request, g, jsonify
import json
from .. import access
from .. import dmutil
from .. import utils
from .. import error
from .. import args


class Draft(object):
    def __init__(self, owner, name, project_id, project_name,
                 description, clone_number):
        self.owner = owner
        self.name = name
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.project_id = project_id
        self.description = description
        self.project_name = project_name
        self.clone_number = clone_number


class DraftEncoder(json.JSONEncoder):
    def default(self, o):
        return o.__dict__


@app.route('/drafts', methods=['POST'])
@crossdomain(origin='*')
@apikey
def create_draft():
    j = request.get_json()
    user = access.get_user()
    name = dmutil.get_optional('name', j, user + "_draft_" + utils.now_str())
    description = dmutil.get_optional('description', j,
                                      "Saved draft for " + user)
    project_id = dmutil.get_required('project_id', j)
    project_name = dmutil.get_required('project_name', j)
    clone_number = dmutil.get_optional('clone_number', j)
    process = dmutil.get_optional('process', j, [])
    d = Draft(user, name, project_id, project_name, description, clone_number)
    d.process = process
    return dmutil.insert_entry('drafts', d.__dict__, return_created=True)


@app.route("/drafts2/<project_id>", methods=['POST'])
@apikey
def save_draft(project_id):
    j = request.get_json()
    j['project_id'] = project_id
    j['owner'] = access.get_user()
    if 'id' in j:
        j['mtime'] = r.now()
        id = j['id']
        r.table('drafts').get(j['id']).update(j).run(g.conn)
    else:
        j['birthtime'] = r.now()
        j['mtime'] = j['birthtime']
        id = dmutil.insert_entry_id('drafts', j)
    return jsonify({'id': id})


@app.route('/drafts/<draft_id>', methods=['PUT'])
@crossdomain(origin='*')
@apikey
def update_draft(draft_id):
    j = request.get_json()
    need_to_update = False
    process = dmutil.get_optional('process', j, None)
    name = dmutil.get_optional('name', j, None)
    description = dmutil.get_optional('description', j, None)
    attrs = {}
    draft = dmutil.get_single_from_table('drafts', draft_id, raw=True)
    if draft is None:
        return error.not_found("No such id: %s" % (draft_id))

    access.check(access.get_user(), draft['owner'])

    if name:
        attrs['name'] = name
        need_to_update = True

    if description:
        attrs['description'] = description
        need_to_update = True

    if process:
        attrs['process'] = process
        need_to_update = True

    if need_to_update:
        attrs['mtime'] = r.now()
        rv = r.table('drafts').get(draft_id).update(attrs).run(g.conn)
        if rv['errors'] != 0:
            return error.\
                update_conflict("Unable to update draft for id: %s"
                                % (draft_id))
    return args.json_as_format_arg({'id': draft_id})


@app.route('/drafts/<draft_id>', methods=['GET'])
@jsonp
@apikey
def get_draft(draft_id):
    draft = dmutil.get_single_from_table('drafts', draft_id, raw=True)
    if draft is None:
        return error.not_found("No such id: %s" % (draft_id))
    access.check(access.get_user(), draft['owner'])
    return args.json_as_format_arg(draft)


@app.route('/drafts/project/<project_id>', methods=['GET'])
@jsonp
@apikey
def get_drafts_for_user(project_id):
    user = access.get_user()
    selection = list(r.table('drafts')
                     .get_all(user, index='owner')
                     .filter({'project_id': project_id})
                     .run(g.conn, time_format='raw'))
    # Now get all the drafts that we have been asked to review
    # TODO: This is a hack that we need to fix
    drafts_for_review = list(r.table('reviews').run(g.conn, time_format='raw'))
    for d in drafts_for_review:
        if 'project_id' in d:
            if d['project_id'] != "":
                if d['requested_to'] == user:
                    item = r.table('drafts').get(d['item_id'])\
                                            .run(g.conn, time_format='raw')
                    if item:
                        selection.append(item)
    return args.json_as_format_arg(selection)


@app.route('/drafts/<draft_id>', methods=['DELETE'])
@crossdomain(origin='*')
@apikey
def delete_draft(draft_id):
    user = access.get_user()
    draft = dmutil.get_single_from_table('drafts', draft_id, raw=True)
    if draft is None:
        error.not_found("No such id: %s" % (draft_id))
    if draft['owner'] != user:
        return error.\
            not_authorized("You are not authorized to delete draft: %s"
                           % (draft_id))
    rv = r.table('drafts').get(draft_id).delete().run(g.conn)
    if rv['deleted'] == 0:
        return error.database_error("Unable to delete draft %s"
                                    % (draft_id))
    return args.json_as_format_arg(draft)
