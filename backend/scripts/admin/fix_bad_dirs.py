#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser


def fix_dirs(conn):
    projcursor = r.table('projects').run(conn)
    for p in projcursor:
        if '/' in p['name']:
            continue
        pdircursor = r.table('project2datadir').get_all(p['id'], index='project_id').eq_join('datadir_id', r.table('datadirs')).zip().run(conn)
        for pdir in pdircursor:
            paths = pdir['name'].split('/')
            if paths[0] != p['name']:
                print("Project '{}' ({}) has bad dir '{}' ({})".format(p['name'], p['id'], pdir['name'], pdir['id']))
                # print(pdir['name'].replace(paths[0], p['name'], 1))
                r.table('datadirs').get(pdir['id']).update({'name': pdir['name'].replace(paths[0], p['name'], 1)}).run(conn)


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int", help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    port = options.port
    conn = r.connect('localhost', port, db='materialscommons')
    fix_dirs(conn)
