#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
import json
import sys


def msg(s):
    print s
    sys.stdout.flush()


def build_notes(conn):
    r.table('notes').delete().run(conn)
    # project notes
    projects = r.table('projects').pluck('notes', 'id').run(conn)
    for project in projects:
        notes = project['notes']
        #insert into notes table
        if len(notes) != 0:
            for each_note in notes:
                r.table('notes').insert({'item_id': project['id'],
                                        'item_type': 'project',
                                        'creator': each_note['who'],
                                        'note': each_note['message'],
                                        'title': each_note['title'],
                                        'birthtime': r.now(),
                                        'mtime': r.now(),
                                        'project_id': project['id']}).run(conn)
    #sample notes
    samples = r.table('samples').pluck('notes', 'id', 'project_id').run(conn)
    for sample in samples:
        notes = sample['notes']
        #insert into notes table
        if len(notes) != 0 and 'project_id' in sample:
            for each_note in notes:
                r.table('notes').insert({'item_id': sample['id'],
                                        'item_type': 'sample',
                                        'creator': each_note['who'],
                                        'note': each_note['message'],
                                        'title': '',
                                        'birthtime': r.now(),
                                        'mtime': r.now(),
                                        'project_id': sample['project_id']})\
                                        .run(conn)


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    if options.port is None:
        options.port = 30815
    conn = r.connect('localhost', options.port, db='materialscommons')
    build_notes(conn)
