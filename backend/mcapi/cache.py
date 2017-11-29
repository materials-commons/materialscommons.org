from flask import g
from os.path import dirname, basename
import json
import rethinkdb as r
import sys


project_tree_cache = {}
gconn = None


def p(msg):
    print(msg)
    sys.stdout.flush()


def load_project_tree_cache(conn):
    p("Loading projects...")
    global gconn
    gconn = conn
    projects = list(r.table('projects').run(conn))
    for project in projects:
        p("  loading project %s..." % (project['name']))
        get_project_tree(project['id'])
    p("Done...")
    gconn = None


def get_project_tree(project_id):
    # if project_id in project_tree_cache:
    #     return project_tree_cache[project_id]

    if gconn is not None:
        conn = gconn
    else:
        conn = g.conn

    selection = list(r.table("project2datadir")
                     .get_all(project_id, index="project_id")
                     .eq_join("datadir_id", r.table("datadirs"))
                     .zip()
                     .merge(lambda dd: {
                         "datafiles": r.table("datadir2datafile")
                         .get_all(dd['id'], index="datadir_id")
                         .eq_join("datafile_id", r.table("datafiles"))
                         .zip()
                         .coerce_to("array")
                         .merge(lambda df: {
                             "tags": r.table("tag2item")
                             .get_all(df['id'], index="item_id")
                             .coerce_to("array"),
                             "notes": r.table("note2item")
                             .get_all(df['id'], index="item_id")
                             .eq_join("note_id", r.table("notes"))
                             .zip()
                             .coerce_to("array")
                         })
                     })
                     .run(conn, time_format="raw"))
    tree = build_tree(selection)
    project_tree_cache[project_id] = tree
    return tree


def reload_project_tree(project_id):
    if project_id in project_tree_cache:
        del project_tree_cache[project_id]
    return get_project_tree(project_id)


class DItem2:
    def __init__(self, id, name, type, owner, birthtime, size):
        self.id = id
        self.selected = False
        self.c_id = ""
        self.level = 0
        self.parent_id = ""
        self.name = name
        self.owner = owner
        self.mediatype = ""
        self.birthtime = birthtime
        self.size = size
        self.displayname = basename(name)
        self.type = type
        self.children = []
        self.datafile_id = id
        self.data = {}


class DEncoder2(json.JSONEncoder):
    def default(self, o):
        return o.__dict__


def build_tree(datadirs):
    next_id = 0
    all_data_dirs = {}
    top_level_dirs = []
    for ddir in datadirs:
        ditem = DItem2(ddir['id'], ddir['name'], 'datadir', ddir['owner'],
                       ddir['birthtime'], 0)
        ditem.level = ditem.name.count('/')
        ditem.tags = []
        ditem.c_id = next_id
        next_id += 1
        ditem.group = True
        #
        # The item may have been added as a parent
        # before it was actually seen. We check for
        # this case and grab the children to add to
        # us now that we have the details for the ditem.
        if ditem.name in all_data_dirs:
            existing_ditem = all_data_dirs[ditem.name]
            ditem.children = existing_ditem.children
        all_data_dirs[ditem.name] = ditem
        if ditem.level == 0:
            top_level_dirs.append(ditem)
        for df in ddir['datafiles']:
            if df['name'][0] == ".":
                continue
            if not df['current']:
                continue
            dfitem = DItem2(df['id'], df['name'], 'datafile',
                            df['owner'], df['birthtime'], df['size'])
            dfitem.fullname = ddir['name'] + "/" + df['name']
            dfitem.c_id = next_id
            next_id += 1
            dfitem.tags = df['tags']
            dfitem.notes = df['notes']
            dfitem.group = False
            # data dict()
            data = dict()
            data['name'] = dfitem.name
            data['owner'] = dfitem.owner
            data['type'] = dfitem.type
            data['mediatype'] = dfitem.mediatype
            data['tags'] = dfitem.tags
            data['notes'] = dfitem.notes
            data['birthtime'] = dfitem.birthtime
            data['id'] = dfitem.id
            data['datafile_id'] = dfitem.id
            data['path'] = dfitem.fullname
            dfitem.data = data
            if 'mediatype' not in df:
                dfitem.mediatype = {"mime": "unknown"}
            elif 'mime' not in df['mediatype']:
                dfitem.mediatype = {"mime": "unknown"}
            else:
                dfitem.mediatype = df['mediatype']
            dfitem.data['mediatype'] = dfitem.mediatype
            ditem.children.append(dfitem)
        parent_name = dirname(ditem.name)
        if parent_name in all_data_dirs:
            parent = all_data_dirs[parent_name]
            parent.children.append(ditem)
        else:
            # We haven't seen the parent yet, but we need
            # to add the children. So, create a parent with
            # name and add children. When we finally see it
            # we will grab the children and add them to the
            # real object.
            parent = DItem2('', parent_name, 'datadir', '', '', 0)
            parent.children.append(ditem)
            all_data_dirs[parent_name] = parent
    return json.dumps(top_level_dirs, cls=DEncoder2)
