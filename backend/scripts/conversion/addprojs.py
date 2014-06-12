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
        sample['projects'] = projects
        r.table('samples').get(sample['id']).update(sample).run(conn)

if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()

    conn = r.connect('localhost', options.port, db='materialscommons')
    main(conn)
