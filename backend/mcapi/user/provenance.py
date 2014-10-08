from ..mcapp import app
from ..decorators import apikey
from .. import dmutil
from flask import jsonify, g, request
import rethinkdb as r
from .. import access
from loader.model import process, note, property


@app.route('/provenance2/<project_id>', methods=['POST'])
@apikey
def create_provenance2(project_id):
    user = access.get_user()
    j = request.get_json()
    id = create_process(j['process'], user)
    create_inputs(j['inputs'], id, user)
    create_outputs(j['outputs'], id, user)
    return jsonify({'id': id})


def create_process(j, user):
    name = dmutil.get_required('name', j)
    template_id = dmutil.get_required('template_id', j)
    project_id = dmutil.get_required('project_id', j)
    machine = ""
    description = dmutil.get_optional('description', j, "")
    p = process.Process(name, user, template_id, project_id,
                        machine, description)
    tags = dmutil.get_optional('tags', j, [])
    notes = dmutil.get_optional('notes', j, [])
    runs = dmutil.get_optional('runs', j, [])
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
        text = dmutil.get_required('text', n)
        title = dmutil.get_required('title', n)
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
    for name, values in ioset.iteritems():
        display_name = dmutil.get_requiree("template_name", values)
        ps = property.PropertySet(name, display_name, ioset_type,
                                  process_id, "process")
        ps_id = dmutil.insert_entry_id("property_sets", ps.__dict__)
        ps_props_bulk = []
        if name == "files":
            create_files_properties(name, values['properties'], ps_id,
                                    ps_props_bulk)
        elif name == "sample":
            create_sample_properties(name, values['properties'], ps_id,
                                     ps_props_bulk)
        else:
            create_properties(name, values['properties'], ps_id,
                              ps_props_bulk)
        r.table("properties").insert(ps_props_bulk).run(g.conn)


def create_files_properties(name, properties, property_set_id, ps_bulk):
    files = dmutil.get_required("files", properties)
    for f in files:
        file_id = dmutil.get_required("id", f)
        file_name = dmutil.get_required("name", f)
        fullname = dmutil.get_required("fullname", f)
        p = property.Property("file", "File", file_id, "file",
                              property_set_id, "property_set")
        p.other['name'] = file_name
        p.other['fullname'] = fullname
        ps_bulk.append(p.__dict__)


def create_sample_properties(name, properties, property_set_id, ps_bulk):
    s = dmutil.get_required('sample', properties)
    sprop = dmutil.get_required("sample", s)
    sample_id = dmutil.get_required("id", sprop)
    sample_name = dmutil.get_required("name", sprop)
    p = property.Property("sample", "Sample", sample_id, "sample",
                          property_set_id, "property_set")
    p.other['name'] = sample_name
    ps_bulk.append(p.__dict__)


def create_properties(name, properties, property_set_id, ps_bulk):
    for prop, values in properties.iteritems():
        display_name = dmutil.get_required("name", values)
        value = dmutil.get_required("value", values)
        if value == "":
            continue
        ptype = property_value_type(value)
        if ptype == "selection":
            value_name = value['name']
            value = value['value']
        unit = dmutil.get_optional("unit", values, "")
        p = property.Property(prop, display_name, value, ptype,
                              property_set_id, "property_set")
        if ptype == "selection":
            p.other['name'] = value_name
        p.unit = unit
        ps_bulk.append(p.__dict__)


def property_value_type(value):
    if type(value) is dict:
        return "selection"
    elif type(value) is str:
        if is_number(value):
            return "number"
        return "string"
    elif type(value) is unicode:
        if is_number(value):
            return "number"
        return "string"
    elif type(value) is float:
        return "number"
    elif type(value) is int:
        return "number"
    elif type(value) is long:
        return "number"
    else:
        return "unknown"


def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False
