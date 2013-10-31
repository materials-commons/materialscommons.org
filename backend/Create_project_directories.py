#!/usr/bin/env python

import requests
import sys
import os
import rethinkdb as r
import json

#conn = r.connect('localhost', 28015, db='materialscommons')


class Project(object):
    def __init__(self, name, datadir, owner):
        self.name = name
        self.description = ""
        self.datadir = datadir
        self.owner = owner
        self.birthtime = ''
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
        self.birthtime = ''
        self.mtime = self.birthtime
        self.atime = self.birthtime
        self.id = userid + "$" + name.replace('/', '_')
        
class Project2DataDir(object):
    def __init__(self, project_id, ddir_id):
        self.project_id = project_id
        self.ddir_id = ddir_id

def create_project(user, apikey):
    directory = os.getcwd()
    project_name = os.path.basename(directory)
    parents = {}
    boolean = '';
    proj = Project(project_name, "", user)
    project_id = None
    for root, dirs, files in os.walk(directory):
        if os.path.basename(root) == ".conversion":
            continue
        datadir_name = construct_datadir_name(project_name, root, directory)
        parents[datadir_name] = ""
        parentname = os.path.dirname(datadir_name)
        parentid = parents[parentname] if parentname in parents else ""
        if datadir_name == project_name:
            boolean = does_project_exist(project_name, apikey)
            if boolean == 'true':
                return 
            else:
                ddir = DataDir(datadir_name, "private", user, parentid)
                ddir_id = add_datadir(ddir)
                parents[datadir_name] = ddir_id
                proj.datadir = ddir_id
                project_id = add_project(proj)
                add_proj_datadir_mapping(project_id, ddir_id)
                
        else:
            ddir = DataDir(datadir_name, "private", user, parentid)
            ddir_id = add_datadir(ddir)
            parents[datadir_name] = ddir_id
            add_proj_datadir_mapping(project_id, ddir_id)
        

def does_project_exist(proj_name, apikey):
    url = "http://titanium.eecs.umich.edu:5000/projects"
    params = { 'format': '' ,'apikey': apikey, 'filter_by': '"name":"'+proj_name+'"'}
    response = requests.get(url, params= params)
    if len(response.text) == 2:
        return 'false'
    else:
       return 'true'

def add_proj_datadir_mapping(project_id, ddir_id):
    if project_id:
        project2datadir = Project2DataDir(project_id, ddir_id)
        url = 'http://titanium.eecs.umich.edu:5000/project/datadir/join/'
        headers = {'content-type': 'application/json'}
        json_data = json.dumps(project2datadir.__dict__)
        response = requests.post(url, data=json_data, headers = headers)
        return response

def add_datadir(ddir):
    url = 'http://titanium.eecs.umich.edu:5000/datadir/test/'
    json_dir_data  = json.dumps(ddir.__dict__)
    headers = {'content-type': 'application/json'}
    response = requests.post(url, data=json_dir_data, headers = headers)
    return response.text

def add_project(proj):
    url = 'http://titanium.eecs.umich.edu:5000/projects/test/'
    json_data  = json.dumps(proj.__dict__)
    headers = {'content-type': 'application/json'}
    response = requests.post(url,data =json_data ,headers = headers)
    return response.text


def construct_datadir_name(base, root, directory):
    rpath = os.path.relpath(root, directory)
    return base + ("" if rpath == "." else "/" + rpath)

def usage():
    print "createproj.py user apikey"
    sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        usage()
    else:
        create_project(sys.argv[1], sys.argv[2])
