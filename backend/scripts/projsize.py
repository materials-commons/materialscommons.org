#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser


def compute_project_size(project_id, conn):
    total = 0
    for f in r.table('project2datafile').get_all(project_id, index="project_id").eq_join('datafile_id', r.table(
            'datafiles')).zip().run(conn):
        total = total + f['size']
    print "Total size %s" % sizeof_fmt(total)


def sizeof_fmt(num, suffix='B'):
    for unit in ['', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi']:
        if abs(num) < 1024.0:
            return "%3.1f%s%s" % (num, unit, suffix)
        num /= 1024.0
    return "%.1f%s%s" % (num, 'Yi', suffix)


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int", help="rethinkdb port", default=30815)
    parser.add_option("-p", "--project-id", dest="project_id", type="string", help="project id")
    (options, args) = parser.parse_args()
    conn = r.connect('localhost', options.port, db="materialscommons")
    compute_project_size(options.project_id, conn)
