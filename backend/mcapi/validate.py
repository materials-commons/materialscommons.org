import rethinkdb as r
from flask import g


def project_name_exists(name, user):
    selection = list(r.table('projects').filter({'name': name, 'owner': user}).run(g.conn))
    if selection:
        return True
    return False


def project_id_exists(proj_id, owner=None):
    return item_id_exists('projects', proj_id, owner)


def datadir_id_exists(ddir_id, owner=None):
    return item_id_exists('datadirs', ddir_id, owner)


def item_id_exists(table, item_id, owner=None):
    item = r.table(table).get(item_id).run(g.conn)
    if item is not None:
        if owner is not None:
            if item['owner'] != owner:
                return None
    return item
