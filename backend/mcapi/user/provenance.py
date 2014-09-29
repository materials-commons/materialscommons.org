from ..mcapp import app
from ..decorators import crossdomain, apikey
from flask import jsonify, g, request
import rethinkdb as r
from .. import access
from .. import error
from .. import dmutil
from .. import doc
from loader.model import sample
from mcapi import mcexceptions
import traceback


class StateCreateSaver(object):
    def __init__(self):
        self.objects = {}

    def insert(self, table, entry):
        rv = r.table('saver').insert(entry).run(g.conn)
        id = rv['generated_keys'][0]
        self.objects[id] = table
        return id

    def insert_newval(self, table, entry):
        if g.rethinkdb_version > 113:
            rr = r.table(table).insert(entry, return_changes=True)
        else:
            rr = r.table(table).insert(entry, return_vals=True)
        rv = rr.run(g.conn)
        id = rv['generated_keys'][0]
        self.objects[id] = table
        return rv

    def move_to_tables(self):
        for key in self.objects:
            table_name = self.objects[key]
            o = r.table('saver').get(key).run(g.conn, time_format='raw')
            r.table(table_name).insert(o).run(g.conn)

    def delete_tables(self):
        for key in self.objects:
            r.table('saver').get(key).delete().run(g.conn)
        self.objects.clear()


class ProvenanceSaver(object):
    def __init__(self, draft_id, user):
        self.draft_id = draft_id
        self.user = user
        self.saver = StateCreateSaver()
        self.process_id = None
        self.project_id = ""
        self.owner = user

    def save(self):
        try:
            self._load_draft()
            return self.process_id
        except mcexceptions.RequiredAttributeException as rae:
            traceback.print_exc()
            self.saver.delete_tables()
            print "Missing attribute: %s" % (rae.attr)
        finally:
            self.saver.delete_tables()

    def _load_draft(self):
        process_id = self._load_provenance_from_draft()
        r.table('drafts').get(self.draft_id).delete().run(g.conn)
        self.saver.move_to_tables()
        self.saver.delete_tables()
        return process_id

    def _load_provenance_from_draft(self):
            draft = r.table('drafts').get(self.draft_id).run(g.conn)
            self.owner = draft['owner']
            self.project_id = draft['project_id']
            self._create_process(draft['process'])

    def _create_process(self, j):
        process = self._new_process(j)
        self.process_id = self.saver.insert('processes', process)
        self.saver.insert('project2processes', {'project_id': self.project_id,
                                                'process_id': self.process_id})
        self._conditions_denorm(process)

    def _conditions_denorm(self, process):
        for attr in process['inputs']:
            self._insert_conditions_denorm(attr, 'input')
        for attr in process['outputs']:
            self._insert_conditions_denorm(attr, 'output')

    def _insert_conditions_denorm(self, attr, step):
        for key in attr['properties']:
            prop = attr['properties'][key]
            prop['process_id'] = self.process_id
            prop['attribute'] = key
            prop['property'] = attr['attribute']
            prop['step'] = step
            self.saver.insert('conditions', prop)

    def _new_process(self, j):
        p = dict()
        p['birthtime'] = r.now()
        p['project'] = self.project_id
        p['name'] = dmutil.get_required('name', j)
        p['description'] = dmutil.get_optional('description', j)
        p['machine'] = self._extract_id('machine', j)
        p['template'] = self._extract_id('template', j)
        p['notes'] = dmutil.get_optional('notes', j, [])
        p['runs'] = dmutil.get_optional('runs', j, [])
        p['owner'] = dmutil.get_required('owner', j)
        p['experiment_run_date'] = dmutil.
                                   get_optional('experiment_run_date', j)
        if p['experiment_run_date'] != "":
            d = p['experiment_run_date']
            if isinstance(d, basestring):
                p['experiment_run_date'] = r.iso8601(d)
        self._process_properties(p, j)
        input_conditions = dmutil.get_optional('input_conditions', j, [])
        output_conditions = dmutil.get_optional('output_conditions', j, [])
        self._create_conditions(input_conditions, output_conditions, p)
        for f in self._process_files('input_files', j):
            p['inputs'].append(f)
        for f in self._process_files('output_files', j):
            p['outputs'].append(f)
        return p

    def _process_properties(self, process, j):
        process['properties'] = {}
        default_props = dmutil.get_required('default_properties', j)
        doc.add_properties(default_props, process)
        added_props = dmutil.get_optional('added_properties', j, [])
        doc.add_properties(added_props, process)

    def _extract_id(self, key, j):
        item = dmutil.get_optional(key, j, None)
        if item is None:
            return ""
        item_id = dmutil.get_optional('id', item)
        return item_id

    def _process_files(self, key, j):
        files_list = dmutil.get_optional(key, j, [])
        files = []
        for f in files_list:
            fattrs = self._new_file(f)
            files.append(fattrs)
        return files

    def _new_file(self, f):
        fattrs = {}
        fattrs['attribute'] = "file"
        fattrs['type'] = "file"
        fattrs['template'] = ""
        properties = {}
        fid = dmutil.get_optional('id', f)
        name = dmutil.get_optional('name', f)
        displayname = dmutil.get_optional('displayname', f)
        properties['id'] = doc.new_prop_attrs("Id", "", fid, "id")
        properties['name'] = doc.new_prop_attrs("Name", "", name, "text")
        properties['displayname'] = doc.new_prop_attrs("Displayname", "",
                                                       displayname, "text")
        fattrs['properties'] = properties
        return fattrs

    def _create_conditions(self, input_conditions, output_conditions, p):
        p['inputs'] = []
        for key in input_conditions:
            values = input_conditions[key]
            if key == "sample":
                c = self._new_sample_condition(values)
            else:
                c = self._new_condition(values)
            if c is not None:
                p['inputs'].append(c)
        p['outputs'] = []
        for key in output_conditions:
            values = output_conditions[key]
            if key == "transformed-sample":
                c = self._create_transformed_sample(values, p['inputs'])
            else:
                c = self._new_condition(values)
            if c is not None:
                p['outputs'].append(c)

    def _new_sample_condition(self, j):
        s = dmutil.get_required('sample', j)
        c = dict()
        properties = {}
        value = dmutil.get_required('name', s)
        properties['name'] = doc.new_prop_attrs("Name", "", value, "text")
        value = dmutil.get_required('id', s)
        properties['id'] = doc.new_prop_attrs("Id", "", value, "id")
        c['properties'] = properties
        c['template'] = dmutil.get_required('id', j)
        c['attribute'] = "sample"
        c['type'] = "id"
        return c

    def _new_condition(self, j):
        c = dict()
        c['template'] = dmutil.get_required('id', j)
        c['properties'] = {}
        c['type'] = 'condition'
        attr = dmutil.get_optional("attribute", j, None)
        if attr is None:
            return None
        c['attribute'] = attr
        default_props = dmutil.get_optional('default_properties', j, [])
        doc.add_properties(default_props, c)

        added_properties = dmutil.get_optional('added_properties', j, [])
        doc.add_properties(added_properties, c)
        return c

    def _new_sample(self, c):
        model = dmutil.get_required("model", c)
        return sample.Sample(model, self.owner)

    def _create_transformed_sample(self, j, inputs):
        s = dmutil.get_required('sample', j)
        value = dmutil.get_optional('is_active', j)
        if not value:
            self._set_availability(s['id'])
        transformed_sample = dict()
        user = access.get_user()
        transformed_sample['name'] = dmutil.get_required('name', s)
        transformed_sample['description'] = dmutil.get_optional('description', s)
        transformed_sample['notes'] = dmutil.get_optional('notes', s)
        transformed_sample['available'] = dmutil.get_optional('available', s)
        transformed_sample['properties'] = dmutil.get_optional('properties', s)
        transformed_sample['birthtime'] = r.now()
        transformed_sample['created_by'] = user
        transformed_sample['owner'] = user
        transformed_sample['treatments'] = []
        transformed_sample['path'] = dmutil.get_required('path', s) + '/' + transformed_sample['name']
        transformed_sample['parent_id'] = dmutil.get_optional('parent_id', s)
        for item in inputs:
            if item['attribute'] == 'heat_treatment':
                transformed_sample['treatments'].append(item)
            if item['attribute'] == 'irraditation_treatment':
                transformed_sample['treatments'].append(item)
        transformed_sample['template'] = dmutil.get_optional('template', s)
        transformed_sample_id = dmutil.insert_entry_id('samples', transformed_sample)
        join_sample_projects(dmutil.get_optional('projects_samples_join', s), transformed_sample_id)
        c = dict()
        properties = {}
        value = dmutil.get_required('name', transformed_sample)
        properties['name'] = doc.new_prop_attrs("Name", "", value, "text")
        properties['id'] = doc.new_prop_attrs("Id", "",  transformed_sample_id, "id")
        c['properties'] = properties
        c['template'] = transformed_sample['template']
        c['attribute'] = "sample"
        c['type'] = "id"
        return c

    def _set_availability(self, sample_id):
        rr = r.table('samples').get(sample_id).update({'available': False}).run(g.conn)
        return rr


@app.route('/provenance2', methods=['POST'])
@apikey
def create_provenance():
    user = access.get_user()
    j = request.get_json()
    draft_id = dmutil.get_required('draft_id', j)
    p = ProvenanceSaver(draft_id, user)
    process_id = p.save()
    if (process_id):
        update_df_denorm(process_id)
        return jsonify({'process': process_id})
    else:
        return error.bad_request('unable to create process')


def update_df_denorm(process_id):
        process = r.table('processes').get(process_id).run(g.conn)
        inputs = process['inputs']
        outputs = process['outputs']
        for i in inputs:
            if i['attribute'] == 'file':
                df_dnorm = {}
                df_dnorm['df_id'] = i['properties']['id']['value']
                df_dnorm['df_name'] = i['properties']['name']['value']
                df_dnorm['process_id'] = process['id']
                df_dnorm['process_name'] = process['name']
                df_dnorm['project_id'] = process['project']
                df_dnorm['file_type'] = 'input'
                r.table('datafiles_denorm').insert(df_dnorm).run(g.conn)
            elif i['attribute'] == 'sample':
                sample_dnorm = {}
                sample_dnorm['sample_id'] = i['properties']['id']['value']
                sample_dnorm['sample_name'] = i['properties']['name']['value']
                sample_dnorm['process_id'] = process['id']
                sample_dnorm['process_name'] = process['name']
                sample_dnorm['project_id'] = process['project']
                sample_dnorm['file_type'] = 'input'
                r.table('samples_processes_denorm').insert(sample_dnorm).run(g.conn)
        for o in outputs:
            if o['attribute'] == 'file':
                df_dnorm = {}
                df_dnorm['df_id'] = o['properties']['id']['value']
                df_dnorm['df_name'] = o['properties']['name']['value']
                df_dnorm['process_id'] = process['id']
                df_dnorm['process_name'] = process['name']
                df_dnorm['project_id'] = process['project']
                df_dnorm['file_type'] = 'output'
                r.table('datafiles_denorm').insert(df_dnorm).run(g.conn)
            elif o['attribute'] == 'sample':
                sample_dnorm = {}
                sample_dnorm['sample_id'] = o['properties']['id']['value']
                sample_dnorm['sample_name'] = o['properties']['name']['value']
                sample_dnorm['process_id'] = process['id']
                sample_dnorm['process_name'] = process['name']
                sample_dnorm['project_id'] = process['project']
                sample_dnorm['file_type'] = 'output'
                r.table('samples_processes_denorm').insert(sample_dnorm).run(g.conn)


def join_sample_projects(old_joins, t_sample_id):
    for each in old_joins:
        r.table('projects2samples').insert({'sample_id': t_sample_id, 'project_id': each['project_id'], 'project_name': each['project_name']}).run(g.conn)
