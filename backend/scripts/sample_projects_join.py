#!/usr/bin/env python

import rethinkdb as r
import optparse
import sys

    
if __name__ == "__main__":
    parser = optparse.OptionParser()
    parser.add_option("-P", "--port", dest="port",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    conn = r.connect('localhost', int(options.port), db='materialscommons')
    samples = r.table('samples').run(conn)
    for sample in samples:
        projects = sample['projects']
        for p in projects:
            rr = r.table('projects2samples').insert({'sample_id': sample['id'], 'project_id': p['id'], 'project_name': p['name']}).run(conn)
            