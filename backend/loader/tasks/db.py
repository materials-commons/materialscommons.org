from celery import Celery
import rethinkdb as r
from ..model.datadir import DataDir
from ..model.datafile import DataFile
from os.path import basename, dirname, splitext, getsize, relpath
import os
from ..utils import mkdirp, runtika
import hashlib
from PIL import Image
import json
from distutils import dir_util
import shutil

celery = Celery('db', broker='amqp://guest@localhost//')

@celery.task
def load_data_dirs(user, dirs, project_id, process_id):
    try:
        r.connect('localhost', 28015, db='materialscommons').repl()
        for directory in dirs:
            load_directory(user, directory, project_id, process_id)
    except Exception as exc:
        raise load_data_dirs.retry(exc=exc)

@celery.task
def load_data_dir(user, directory, project_id, process_id):
    try:
        r.connect('localhost', 28015, db='materialscommons').repl()
        load_directory(user, directory, project_id, process_id)
    except Exception as exc:
        raise load_data_dir.retry(exc=exc)

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

def copy_data_over(dirpath):
    print "Copying over: %s" % (dirpath)
    # For now hard code where we copy data to
    dir_util.copy_tree(dirpath, '/var/www/html/assets/materialscommons')
    print "Removing dir: %s" % (dirpath)
    shutil.rmtree(dirpath)

def load_directory(user, directory, project_id, process_id):
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

def fix_name(dir_name):
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

def add_dfids_to_process(process_id, df_ids):
    process = r.table('processes').get(process_id).run()
    for id in df_ids:
        process['output_files'].append(id)
    output_files = process['output_files']
    r.table('processes').get(process_id).update({'output_files':output_files}).run()
