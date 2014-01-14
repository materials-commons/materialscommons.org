from celery import Celery
import rethinkdb as r
from ..model.datadir import DataDir
from ..model.datafile import DataFile
from mcapi import dmutil
from mcapi import mcexceptions
from os.path import basename, dirname, splitext, getsize, relpath
import os
from ..utils import mkdirp, runtika
import hashlib
from PIL import Image
import json
from distutils import dir_util
import shutil
import traceback

celery = Celery('db', broker='amqp://guest@localhost//')

class StateCreateSaver(object):
    def __init__(self):
        self.objects = {}

    def insert(self, table, entry):
        rv = r.table('saver').insert(entry).run()
        id = rv['generated_keys'][0]
        self.objects[id] = table
        return id

    def insert_newval(self, table, entry):
        rv = r.table('saver').insert(entry, return_vals=True).run()
        id = rv['generated_keys'][0]
        self.objects[id] = table
        return rv

    def move_to_tables(self):
        for key in self.objects:
            table_name = self.objects[key]
            o = r.table('saver').get(key).run(time_format='raw')
            r.table(table_name).insert(o).run()

    def delete_tables(self):
        for key in self.objects:
            r.table('saver').get(key).delete().run()
        self.objects.clear()

@celery.task
def load_data_dirs(user, dirs, state_id):
    try:
        r.connect('localhost', 30815, db='materialscommons').repl()
        for directory in dirs:
            load_directory(user, directory, state_id)
    except Exception as exc:
        raise load_data_dirs.retry(exc=exc)
    
@celery.task
def load_data_dir(user, directory, state_id):
    state_saver = StateCreateSaver()
    try:
        r.connect('localhost', 30815, db='materialscommons').repl()
        load_data(user, directory, state_id, state_saver)
    except mcexceptions.RequiredAttributeException as rae:
        traceback.print_exc()
        state_saver.delete_tables()
        print "Missing attribute: %s" % (rae.attr)
    except Exception as exc:
        traceback.print_exc()
        state_saver.delete_tables()
        raise load_data_dir.retry(exc=exc)
    finally:
        state_saver.delete_tables()
        
        
def load_data_dir_1(user, state_id):
    state_saver = StateCreateSaver()
    try:
        r.connect('localhost', 30815, db='materialscommons').repl()
        load_data_1(user, state_id, state_saver)
    except mcexceptions.RequiredAttributeException as rae:
        traceback.print_exc()
        state_saver.delete_tables()
        print "Missing attribute: %s" % (rae.attr)
    except Exception as exc:
        traceback.print_exc()
        state_saver.delete_tables()
        raise load_data_dir.retry(exc=exc)
    finally:
        state_saver.delete_tables()

@celery.task
def load_data_file(datafile, project, datadir):
    try:
        r.connect('localhost', 30815, db='materialscommons').repl()
    except Exception as exc:
        traceback.print_exc()
        raise load_data_file.retry(exc=exc)

@celery.task
def import_data_dir_to_repo(dirpath):
    try:
        print "Copying over: %s" %(dirpath)
        copy_data_over(dirpath)
    except Exception as exc:
        raise import_data_dir_to_repo.retry(exc)

@celery.task
def import_data_dirs_to_repo(dirpaths):
    try:
        for directory in dirpaths:
            copy_data_over(directory)
    except Exception as exc:
        raise import_data_dirs_to_repo.retry(exc)

def load_data(user, directory, state_id, state_saver):
    load_provenance_from_state(state_id, state_saver)
    load_directory(user, directory, state_saver.process_id)
    r.table('state').get(state_id).delete().run()
    state_saver.move_to_tables()
    state_saver.delete_tables()
    

def load_data_1(user, state_id, state_saver):
    load_provenance_from_state_1(state_id, state_saver)
    r.table('state').get(state_id).delete().run()
    state_saver.move_to_tables()
    state_saver.delete_tables()

def copy_data_over(dirpath):
    print "Copying over: %s" % (dirpath)
    # For now hard code where we copy data to
    dir_util.copy_tree(dirpath, '/var/www/html/assets/materialscommons')
    print "Removing dir: %s" % (dirpath)
    shutil.rmtree(dirpath)

def load_provenance_from_state(state_id, saver):
    state = r.table('state').get(state_id).run()
    attributes = state['attributes']
    user = state['owner']
    project_id = attributes['project']['id']
    saver.project_id = project_id
    create_process_from_template(attributes['process'], saver)
    process_id = saver.process_id
    if 'input_files' in attributes:
        add_input_files_to_process(process_id, attributes['input_files'])
    input_conditions = dmutil.get_optional('input_conditions', attributes, [])
    output_conditions = dmutil.get_optional('output_conditions', attributes, [])
    create_conditions_from_templates(process_id, user, input_conditions, output_conditions, saver)
    return process_id

def load_provenance_from_state_1(state_id, saver):
    state = r.table('state').get(state_id).run()
    attributes = state['attributes']
    user = state['owner']
    project_id = attributes['project_id']
    saver.project_id = project_id
    create_process_from_template_1(attributes['process'], saver)
    process_id = saver.process_id
    if 'input_files' in attributes:
        r.table('saver').get(process_id).update({'input_files': attributes['input_files']}).run()
    if 'output_files' in attributes:
        r.table('saver').get(process_id).update({'output_files': attributes['output_files']}).run()
    input_conditions = dmutil.get_optional('input_conditions', attributes, [])
    output_conditions = dmutil.get_optional('output_conditions', attributes, [])
    create_conditions_from_templates(process_id, user, input_conditions, output_conditions, saver)
    return process_id


def create_process_from_template(j, saver):
    project_id = saver.project_id
    p = dict()
    p['template'] = dmutil.get_required('id', j)
    p['project'] = project_id
    m = j['model']
    p['name'] = dmutil.get_required_prop('name', m)
    p['birthtime'] = r.now()
    p['mtime'] = p['birthtime']
    p['machine'] = dmutil.get_optional_prop('machine', m)
    p['process_type'] = dmutil.get_required_prop('process_type', m)
    p['description'] = dmutil.get_required_prop('description', m)
    p['version'] = dmutil.get_optional_prop('version', m)
    p['notes'] = dmutil.get_optional_prop('notes', m, [])
    p['input_conditions'] = dmutil.get_optional_prop('input_conditions', m, [])
    p['input_files'] = dmutil.get_optional_prop('input_files', m, [])
    p['output_conditions'] = dmutil.get_optional_prop('output_conditions', m, [])
    p['output_files'] = dmutil.get_optional_prop('output_files', m, [])
    p['runs'] = dmutil.get_optional_prop('runs', m, [])
    p['citations'] = dmutil.get_optional_prop('citations', m, [])
    p['status'] = dmutil.get_optional_prop('status', m)
    process_id = saver.insert('processes', p)
    saver.process_id = process_id
    saver.insert('project2processes', {'project_id': project_id, 'process_id': process_id})
    
    
def create_process_from_template_1(j, saver):
    project_id = saver.project_id
    p = dict()
    p['project'] = project_id
    p['name'] = dmutil.get_required('name', j)
    p['birthtime'] = r.now()
    p['mtime'] = p['birthtime']
    p['machine'] = dmutil.get_optional('machine', j)
    p['process_type'] = dmutil.get_optional('process_type', j)
    p['description'] = dmutil.get_optional('description', j)
    p['version'] = dmutil.get_optional('version', j)
    p['template'] = dmutil.get_required('template', j)
    p['notes'] = dmutil.get_optional('notes', j, [])
    p['input_conditions'] = dmutil.get_optional('input_conditions', j, [])
    p['input_files'] = dmutil.get_optional('input_files', j, [])
    p['output_conditions'] = dmutil.get_optional('output_conditions', j, [])
    p['output_files'] = dmutil.get_optional('output_files', j, [])
    p['runs'] = dmutil.get_optional('runs', j, [])
    p['citations'] = dmutil.get_optional('citations', j, [])
    p['status'] = dmutil.get_optional('status', j)
    process_id = saver.insert('processes', p)
    saver.process_id = process_id
    saver.insert('project2processes', {'project_id': project_id, 'process_id': process_id})

def add_input_files_to_process(process_id, input_files):
    process = r.table('saver').get(process_id).run()
    for id in input_files:
        process['input_files'].append(id)
    ifiles = process['input_files']
    r.table('saver').get(process_id).update({'input_files':ifiles}).run()
    
    
def add_output_files_to_process(process_id, output_files):
    process = r.table('saver').get(process_id).run()
    for id in output_files:
        process['output_files'].append(id)
    ifiles = process['output_files']
    r.table('saver').get(process_id).update({'output_files':ifiles}).run()

def create_conditions_from_templates(process_id, user, input_conditions, output_conditions, saver):
    for condition_name in input_conditions:
        condition = input_conditions[condition_name]
        condition[u'condition_type'] = 'input_conditions'
        create_condition_from_template(process_id, user, condition, saver)
    for condition_name in output_conditions:
        condition = output_conditions[condition_name]
        condition[u'condition_type'] = 'output_conditions'
        create_condition_from_template(process_id, user, condition, saver)
    

def create_condition_from_template(process_id, user, j, saver):
    c = dict()
    m = j['model']
    type_of_condition = dmutil.get_required('condition_type', j)
    c['owner'] = user
    c['template'] = dmutil.get_required('id', j)
    c['name'] = dmutil.get_required('name', j) #dmutil.get_required('template_name', j) = every condition instance should have its own name
    c['description'] = dmutil.get_optional('description', j)
    for attr in m:
        c[attr['name']] = attr['value']
    c_id = saver.insert('conditions', c)
    new_conditions = r.table('saver').get(process_id)[type_of_condition].append(c_id).run()
    r.table('saver').get(process_id).update({type_of_condition:new_conditions}).run()

def load_directory(user, directory, process_id):
    parents = {}
    base = basename(directory)
    df_ids = []
    for root, dirs, files in os.walk(directory):
        if basename(root) == ".conversion" :
            continue
        dir_name = construct_datadir_name(base, root, directory)
        location = dir_name
        parents[dir_name] = ""
        parentname = dirname(dir_name)
        parentid = parents[parentname] if parentname in parents else ""
        fixed_name = fix_name(dir_name)
        if fixed_name is None:
            continue
        ddir = DataDir(fixed_name, "private", user, parentid)
        for datafile in files:
            id = load_data_file(datafile, location, ddir.id, user, root)
            df_ids.append(id)
            ddir.datafiles.append(id)
        rv = r.table('datadirs').insert(ddir.__dict__, return_vals=True).run()
        dbobj = rv['new_val']
        if rv['errors']:
            for data_item in ddir.datafiles:
                dbobj['datafiles'].append(data_item)
            r.table('datadirs').update(dbobj).run()
        parents[dir_name] = dbobj['id']
    add_dfids_to_process(process_id, df_ids)

def add_dfids_to_process(process_id, df_ids):
    process = r.table('saver').get(process_id).run()
    for id in df_ids:
        process['output_files'].append(id)
    output_files = process['output_files']
    r.table('saver').get(process_id).update({'output_files':output_files}).run()

def fix_name(dir_name):
    """The dir path at this point has the project name
included in it. We want to strip out the pieces we
don't care about.
"""
    if '/' not in dir_name:
        return None
    slash = dir_name.index('/')
    return dir_name[slash+1:]

def construct_datadir_name(base, root, directory):
    rpath = relpath(root, directory)
    return base + ("" if rpath == "." else "/" + rpath)

def load_data_file(datafile, location, ddirid, user, root):
    data_item = DataFile(datafile, "private", user)
    path = getpath(root, datafile)
    mediatype = get_media_type(path)
    data_item.mediatype = mediatype
    data_item.location = fix_name(location)
    data_item.checksum = getchecksum(path)
    data_item.size = getsize(path)
    metatags = get_meta_tags(path)
    convert_file_if_needed(path, mediatype)
    data_item.datadirs.append(ddirid)
    data_item.metatags = metatags
    dbobj = r.table('datafiles').insert(data_item.__dict__, return_vals=True).run()['new_val']
    data_item.id = dbobj['id']
    return dbobj['id']

def getpath(root, datafile):
    path = root + '/' + datafile
    print "File: " + path
    return path

def convert_file_if_needed(path, mediatype):
    if mediatype == "image/tiff":
        dir = dirname(path)
        conversiondir = os.path.join(dir, ".conversion")
        mkdirp(conversiondir)
        filename = basename(path)
        file, ext = splitext(filename)
        im = Image.open(path)
        saveto = os.path.join(conversiondir, file + ".jpg")
        if im.mode != 'RGB':
            im = im.convert('RGB')
        im.save(saveto)

def getchecksum(path):
    with open(path) as fd:
        data = fd.read()
        return hashlib.md5(data).hexdigest()

def get_meta_tags(path):
    data = runtika("-j", path)
    d = json.loads(data)
    metatags = []
    for key in d.keys():
        if usetag(key, d[key]):
            entry = {'name': key, 'value': str(d[key])}
            metatags.append(entry)
    return metatags

def usetag(tagname, tagdata):
    if "Unknown tag" in tagname:
        if isinstance(tagdata, unicode):
            value = ''.join(tagdata.split())
            return not value.isdigit()
        else:
            return True
    else:
        return True

def get_media_type(path):
    return runtika("-d", path).rstrip()