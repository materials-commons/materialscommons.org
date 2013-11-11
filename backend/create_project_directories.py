#!/usr/bin/env python
from os import environ
import requests
import sys
import os
import json

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
            
def create_project(user, apikey, base_url):
    directory = os.getcwd()
    project_name = os.path.basename(directory)
    parents = {}
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
            if does_project_exist(project_name, apikey, base_url):
                return
            else:
                ddir = DataDir(datadir_name, "private", user, parentid)
                ddir_id = add_datadir(ddir, base_url, project_id)
                parents[datadir_name] = ddir_id
                proj.datadir = ddir_id
                project_id = add_project(proj, base_url)
        else:
            ddir = DataDir(datadir_name, "private", user, parentid)
            ddir_id = add_datadir(ddir, base_url, project_id)
            parents[datadir_name] = ddir_id
                    

def does_project_exist(proj_name, apikey, base_url):
    url = base_url+'/projects'
    params = { 'format': '' ,'apikey': apikey, 'filter_by': '"name":"'+proj_name+'"'}
    response = requests.get(url, params= params)
    if len(response.text) == 2:
        return False
    else:
       return True

def add_datadir(ddir, base_url, project_id):
    url = base_url+'/datadir'
    dir_dict = ddir.__dict__
    dir_dict['project_id'] = project_id
    json_dir_data  = json.dumps(dir_dict)
    headers = {'content-type': 'application/json'}
    response = requests.post(url, data=json_dir_data, headers = headers)
    return response.text
    
def add_project(proj, base_url):
    url = base_url+'/projects'
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
        _MCDB_HOST = environ.get('MCURL') or 'localhost'
        if _MCDB_HOST == "localhost":
            base_url = 'http://localhost:5000'
        else:
            base_url = 'https://materialscommons.org'
        create_project(sys.argv[1], sys.argv[2], base_url)
