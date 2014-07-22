#!/usr/bin/env python

import rethinkdb as r
import optparse
import sys

def add_paths(working_list):
    for wl in working_list:
        if wl['parent_id']:
            parent_name = list(r.table('samples').filter({'id': wl['parent_id']}).pluck('path').run(conn))
            construct_path = parent_name[0]['path'] + '/' + wl['name']
            rr = r.table('samples').get(wl['id']).update({'path': construct_path}).run(conn)
        else:
            rr = r.table('samples').get(wl['id']).update({'path': wl['name']}).run(conn)
            
def reset_list(next_list):
    working_list = []
    working_list = next_list
    add_paths(working_list)
    next_list = []
    for wl in working_list:
        result = list(r.table('samples').filter({'parent_id': wl['id']}).run(conn))
        if len(result) != 0:
            for res in result:
                next_list.append(res)
    if len(next_list) == 0:
        return
    else:
        reset_list(next_list)
    
if __name__ == "__main__":
    parser = optparse.OptionParser()
    parser.add_option("-P", "--port", dest="port",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    conn = r.connect('localhost', int(options.port), db='materialscommons')
    samples_by_parent_0 = r.table('samples').with_fields('id', 'name', 'parent_id').filter({'parent_id': ''}).run(conn)
    for sample in samples_by_parent_0:
        working_list = []
        next_list = []
        working_list.append(sample)
        add_paths(working_list)
        next_list = list(r.table('samples').filter({'parent_id': sample['id']}).run(conn))
        if next_list:
            reset_list(next_list)

    
    
    