#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser


def main(conn):
    groups = list(r.table('usergroups').run(conn))
    for group in groups:
        owner = group['owner']
        projects = list(r.table('projects').filter({'owner': owner})
                        .pluck('id', 'name').run(conn))
        group['projects'] = projects
        r.table('usergroups').get(group['id']).update(group).run(conn)

    samples = list(r.table('samples').run(conn))
    for sample in samples:
        owner = sample['owner']
        projects = list(r.table('projects').filter({'owner': owner})
                        .pluck('id', 'name').run(conn))
        for p in projects:
            prj_sample = {}
            prj_sample['sample_id'] = sample['id']
            prj_sample['project_id'] = p['id']
            prj_sample['project_name'] = p['name']
            rr = r.table('projects2samples').insert(prj_sample).run(conn)


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()

    conn = r.connect('localhost', options.port, db='materialscommons')
    main(conn)
