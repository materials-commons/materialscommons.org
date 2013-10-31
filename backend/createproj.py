#!/usr/bin/env python

import requests
import sys
import os
from loader.model import datadir, project
import rethinkdb as r

conn = r.connect('localhost', 28015, db='materialscommons')


class Project(object):
    def __init__(self, name, datadir, owner):
        self.name = name
        self.description = ""
        self.datadir = datadir
        self.owner = owner
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.notes = []
        self.tags = []
        self.reviews = []
        self.mytags = []

class DataDir(object):
    def __init__(self, name, access, userid, parent):
        self.access = access
        self.owner = userid
        self.marked_for_review = False
        self.name = name
        self.datafiles = []
        self.dataparams = []
        self.users = []
        self.tags = []
        self.mytags = []
        self.users.append(userid)
        self.parent = parent
        self.reviews = []
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.atime = self.birthtime
        self.id = userid + "$" + name.replace('/', '_')


def create_project(user):
    directory = os.getcwd()
    print directory
    project_name = os.path.basename(directory)
    print project_name
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
    requests.post("http://localhost:5000/v1.0/projects", data=proj)
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
