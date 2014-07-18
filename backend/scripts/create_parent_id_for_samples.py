#!/usr/bin/env python

import rethinkdb as r
import optparse
import sys


def update_path_for_output_sample(inputs, outputs):
    for i in inputs:
        if(i['attribute'] == 'sample'):
            input_sample_id = i['properties']['id']['value']
            input_sample = r.table('samples').get(input_sample_id).run(conn)
    for o in outputs:
        if(o['attribute'] == 'sample'):
            output_sample_id = o['properties']['id']['value']
            output_sample = r.table('samples').get(input_sample_id).run(conn)
    rr = r.table('samples').filter({'id': output_sample_id}).update({'parent_id': input_sample_id}).run(conn)
    print rr

if __name__ == "__main__":
    parser = optparse.OptionParser()
    parser.add_option("-P", "--port", dest="port",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    conn = r.connect('localhost', int(options.port), db='materialscommons')
    samples = r.table('samples').run(conn)
    processes = r.table('processes').run(conn)
    for sample in samples:
        for p in processes:
            outputs = []
            outputs = p['outputs']
            for o in outputs:
                if (o['attribute'] == 'sample'):
                    update_path_for_output_sample(p['inputs'], p['outputs'])
                     
            

    
    
    