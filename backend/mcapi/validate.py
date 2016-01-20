import rethinkdb as r
from flask import g
import access


def project_name_exists(name, user):
    if access.is_administrator(user):
        rql = r.table('projects').filter({'name': name})
    else:
        rql = r.table('access').get_all(user, index='user_id').eq_join('project_id', r.table('projects')).zip()\
            .filter({'name': name})

    selection = list(rql.run(g.conn))
    if selection:
        return True
    return False


def project_id_exists(proj_id, project_id, owner=None):
    return item_id_exists('projects', proj_id, project_id, owner)


def datadir_id_exists(ddir_id, project_id, owner=None):
    return item_id_exists('datadirs', ddir_id, project_id, owner)


def datadir_path_exists(ddir_name, project_id):
    selection = list(r.table('datadirs').get_all(ddir_name, index="name")
                     .run(g.conn))
    if not selection:
        return False
    ddir_id = [ddir['id'] for ddir in selection]
    selection = list(r.table('project2datadir')
                     .get_all(*ddir_id, index="datadir_id")
                     .filter({"project_id": project_id})
                     .run(g.conn))
    if selection:
        return True
    return False


def item_id_exists(table, item_id, project_id, user=None):
    item = r.table(table).get(item_id).run(g.conn)
    if item is not None:
        if user is not None:
            if access.allowed(user, item['owner'], project_id):
                return item
            else:
                return None
    return item
