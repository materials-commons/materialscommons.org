#!/usr/bin/env python

#import requests
import sys
import os
from loader.model import datadir, project
import rethinkdb as r

conn = r.connect('localhost', 28015, db='materialscommons')

def create_project(user):
    directory = os.getcwd()
    project_name = os.path.basename(directory)
    parents = {}
    proj = project.Project(project_name, "", user)
    project_id = None
    for root, dirs, files in os.walk(directory):
        if os.path.basename(root) == ".conversion":
            continue
        datadir_name = construct_datadir_name(project_name, root, directory)
        parents[datadir_name] = ""
        parentname = os.path.dirname(datadir_name)
        parentid = parents[parentname] if parentname in parents else ""
        if datadir_name == project_name:
            ddir = datadir.DataDir(datadir_name, "private", user, parentid)
            ddir_id = add_datadir(ddir)
            parents[datadir_name] = ddir_id
            proj.datadir = ddir_id
            project_id = add_project(proj)
        else:
            ddir = datadir.DataDir(datadir_name, "private", user, parentid)
            ddir_id = add_datadir(ddir)
            parents[datadir_name] = ddir_id
        add_proj_datadir_mapping(project_id, ddir_id)

def add_proj_datadir_mapping(project_id, ddir_id):
    if project_id:
        r.table('project2datadir').insert({'project_id':project_id, 'datadir_id':ddir_id}).run(conn)

def add_datadir(ddir):
    r.table('datadirs').insert(ddir.__dict__, return_vals=True).run(conn)
    return ddir.id

def add_project(proj):
    rv = r.table('projects').insert(proj.__dict__).run(conn)
    if rv[u'inserted'] == 1:
        key = rv['generated_keys'][0]
        return key
    return None

def construct_datadir_name(base, root, directory):
    rpath = os.path.relpath(root, directory)
    return base + ("" if rpath == "." else "/" + rpath)

def usage():
    print "createproj.py user"
    sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        usage()
    else:
        create_project(sys.argv[1])
