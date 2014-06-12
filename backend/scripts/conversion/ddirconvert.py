#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
import sys

conn = r.connect('localhost', 30815, db='materialscommons')

proj_id = ''
user = ''


def main():
    old_to_new = {}
    owner = {'owner': user}
    datadir_rql = r.table('project2datadir').get_all(proj_id, index='project_id')
    datadir_rql = datadir_rql.eq_join('datadir_id', r.table('datadirs'))
    datadir_rql = datadir_rql.zip().without('datadir_id')
    datadirs = datadir_rql.run(conn)

    # Remove from project2datadir
    r.table('project2datadir').get_all(proj_id, index='project_id').delete().run(conn)

    # Delete old datadirs
    for datadir in datadirs:
        r.table('datadirs').get(datadir['id']).delete().run(conn)
        old_id = datadir['id']
        del datadir['id']
        rv = r.table('datadirs').insert(datadir).run(conn)
        new_id = rv['generated_keys'][0]
        old_to_new[old_id] = new_id
        r.table('project2datadir').insert({'project_id': proj_id, 'datadir_id': new_id}).run(conn)

    # Update datafiles
    datafiles = r.table('datafiles').filter(owner).run(conn)
    for datafile in datafiles:
        old_dir_id = datafile['datadirs'][0]
        if old_dir_id in old_to_new:
            del datafile['datadirs'][0]
            id_to_add = old_to_new[old_dir_id]
            datafile['datadirs'].append(id_to_add)
            r.table('datafiles').get(datafile['id']).update(datafile).run(conn)

    # Update project
    proj = r.table('projects').get(proj_id).run(conn)
    new_dir_id = old_to_new[proj['datadir']]
    proj['datadir'] = new_dir_id
    r.table('projects').get(proj['id']).update(proj).run(conn)


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-p", "--project", dest="proj_name",
                      help="project name to update", type="string")

    (options, args) = parser.parse_args()

    if options.proj_name is None:
        print "You must give a project"
        sys.exit(1)

    projs = list(r.table('projects').get_all(options.proj_name, index="name").run(conn))

    if len(projs) != 1:
        print "Unknown project %s" % (options.proj_name)
        sys.exit(1)

    proj = projs[0]

    user = proj['owner']
    proj_id = proj['id']

    main()
