from ..mcapp import app
from ..decorators import apikey, jsonp
import json
from flask import g
import rethinkdb as r
from os.path import dirname, basename
from ..utils import json_for_single_item_list
from ..args import add_all_arg_options, json_as_format_arg
from .. import access

@app.route('/datadir/<path:datadirid>')
@apikey(shared=True)
@jsonp
def datadir_for_user(datadirid):
    user = access.get_user()
    rr = r.table('datadirs').filter({'owner':user, 'id':datadirid})
    rr = add_all_arg_options(rr)
    selection = list(rr.run(g.conn, time_format='raw'))
    return json_for_single_item_list(selection)

@app.route('/datadirs')
@apikey(shared=True)
@jsonp
def datadirs_for_user():
    user = access.get_user()
    rr = r.table('datadirs').filter({'owner':user})
    rr = add_all_arg_options(rr)
    selection = list(rr.run(g.conn, time_format='raw'))
    return json_as_format_arg(selection)

@app.route('/datadirs/datafiles')
@apikey(shared=True)
@jsonp
def list_datadirs_with_data_by_user():
    user = access.get_user()
    selection = list(r.table('datadirs').filter({'owner':user}).outer_join(\
            r.table('datafiles'), lambda ddirrow, drow: ddirrow['datafiles'].contains(drow['id']))\
                     .run(g.conn, time_format='raw'))
    if not selection:
        return json.dumps(selection)
    datadirs = []
    current_datadir = selection[0]['left']
    current_datadir['datafiles'] = []
    currentid = current_datadir['id']
    datadirs.append(current_datadir)
    for item in selection:
        id = item['left']['id']
        if id == currentid:
            if 'right' in item:
                current_datadir['datafiles'].append(item['right'])
        else:
            current_datadir = item['left']
            current_datadir['datafiles'] = []
            currentid = current_datadir['id']
            if 'right' in item:
                current_datadir['datafiles'].append(item['right'])
            datadirs.append(current_datadir)
    return json_as_format_arg(datadirs)

class DItem:
    def __init__(self, id, name, type):
        self.id = id
        self.name = name
        self.displayname = basename(name)
        self.type = type
        self.children = []

class DEncoder(json.JSONEncoder):
    def default(self, o):
        return o.__dict__

@app.route('/datadirs/tree/groups')
@apikey
@jsonp
def group_datadirs_as_tree():
    user = access.get_user()
    allowedUsers = list(r.table('usergroups').filter(r.row['users'].contains(user))\
                        .concat_map(lambda g: g['users']).distinct().run(g.conn))
    users = '(' + '|'.join(allowedUsers) + ')'
    selection = list(r.table('datadirs').filter(r.row['owner'].match(users))\
                         .pluck('id', 'name', 'datafiles')\
                         .order_by('name')\
                         .outer_join(r.table('datafiles').pluck('id', 'name'), \
                                         lambda ddrow, drow: ddrow['datafiles'].contains(drow['id']))\
                         .run(g.conn, time_format='raw'))
    return buildTreeFromSelection(selection)

@app.route('/datadirs/tree')
@apikey
@jsonp
def user_datadirs_as_tree():
    user = access.get_user()
    selection = list(r.table('datadirs').filter({'owner':user})\
                         .pluck('id', 'name', 'datafiles')\
                         .order_by('name')\
                         .outer_join(r.table('datafiles').pluck('id', 'name'), \
                                         lambda ddrow, drow: ddrow['datafiles'].contains(drow['id']))\
                         .run(g.conn, time_format='raw'))
    return buildTreeFromSelection(selection)

def buildTreeFromSelection(selection):
    if not selection:
        return json.dumps(selection, indent=4)
    topLevelDirs = []
    allDataDirs = {}
    # The first entry is a top level dir
    ddir = selection[0]['left']
    currentDataDir = addToTopLevelDirs(ddir, topLevelDirs)
    allDataDirs[currentDataDir.name] = currentDataDir
    for item in selection:
        ddir = item['left']
        if 'right' in item:
            data = item['right']
        else:
            data = None
        if ddir['name'] <> currentDataDir.name:
            if ddir['name'] not in allDataDirs:
                if isTopLevel(ddir):
                    dd = addToTopLevelDirs(ddir, topLevelDirs)
                    allDataDirs[dd.name] = dd
                elif ddir['name'] in allDataDirs:
                    dd = allDataDirs[ddir['name']]
                else:
                    dd = DItem(ddir['id'], ddir['name'], "datadir")
                    allDataDirs[dd.name] = dd
                    dirToAddTo = allDataDirs[dirname(dd.name)]
                    dirToAddTo.children.append(dd)
                currentDataDir = dd
            else:
                currentDataDir = allDataDirs[ddir['name']]
        if data:
            data = DItem(data['id'], data['name'], "datafile")
            currentDataDir.children.append(data)
    return json.dumps(topLevelDirs, indent=4, cls=DEncoder)

def isTopLevel(ddir):
    # Top level dirs don't have a '/' in their names
    return "/" not in ddir['name']

def addToTopLevelDirs(ddir, topLevelDirs):
    item = find_in_ditem_list(ddir['name'], topLevelDirs)
    if not item:
        dd = DItem(ddir['id'], ddir['name'], "datadir")
        topLevelDirs.append(dd)
        item = dd
    return item

def find_in_ditem_list(name, items):
    for item in items:
        if item.name == name:
            return item
    return None
