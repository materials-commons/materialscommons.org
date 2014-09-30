from ..mcapp import app
from ..decorators import apikey
from .. import dmutil
from flask import jsonify, g, request
import rethinkdb as r
from .. import access
from .. import error
from loader.model import sample, process, note, property


class File(object):
    def __init__(self):
        pass


class Conditions(object):
    def __init__(self):
        pass


@app.route('/provenance2/<project_id>', methods=['POST'])
@apikey
def create_provenance(project_id):
    user = access.get_user()
    j = request.get_json()
    id = create_process(j, user)
    create_inputs(j['inputs'], id, user)
    create_outputs(j['outputs'], id, user)
    return jsonify({'id': id})


def create_process(j, user):
    name = dmutil.get_required(j, 'name')
    template_id = dmutil.get_required(j, 'template_id')
    machine = ""
    description = dmutil.get_option(j, 'description', "")
    p = process.Process(name, user, template_id, machine, description)
    tags = dmutil.get_optional(j, 'tags', [])
    notes = dmutil.get_optional(j, 'notes', [])
    runs = dmutil.get_optional(j, 'runs', [])
    id = dmutil.insert_entry_id('processes', p.__dict__)
    create_process_tags(tags, id)
    create_process_notes(notes, id, user)
    create_process_runs(runs, id)
    return id


def create_process_tags(tags, process_id):
    pass


def create_process_notes(notes, process_id, user):
    bulk_notes = []
    for n in notes:
        text = dmutil.get_required(n, 'text')
        title = dmutil.get_required(n, 'title')
        bulk_note = note.Note(user, text, title, process_id, "process")
        bulk_notes.append(bulk_note.__dict)
    r.table('notes').insert(bulk_notes).run(g.conn)


def create_process_runs(runs, process_id):
    bulk_runs = []
    for run in runs:
        pass


def create_inputs(inputs, process_id, user):
    create_property_set(inputs, "inputs", process_id, user)


def create_outputs(outputs, process_id, user):
    create_property_set(outputs, "outputs", process_id, user)


def create_property_set(ioset, ioset_type, process_id, user):
    for prop_set_name, prop_set_values in ioset:
        ps = property.PropertySet(prop_set_name, ioset_type, process_id,
                                  "process")
        ps_id = dmutil.insert_entry_id("property_set", ps.__dict__)
        ps_props_bulk = []
        for key, pvalue in prop_set_values['properties']:
            display_name = dmutil.get_required(pvalue, "display_name")
            value = dmutil.get_required(pvalue, "value")
            if type(value) is dict:
                value_name = value.name
                value = value.value
            else:
                value_name = ""
            unit = dmutil.get_optional(pvalue, "unit", "")
            p = property.Property(key, display_name, value, ps_id,
                                  "property_set")
            p.value_name = value_name
            p.unit = unit
            ps_props_bulk.append(p.__dict__)
        r.table("properties").insert(ps_props_bulk).run(g.conn)
