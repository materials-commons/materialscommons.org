#!/usr/bin/env python

import rethinkdb as r
import optparse


def update_path_for_output_sample(inputs, outputs):
    for i in inputs:
        if(i['attribute'] == 'sample'):
            input_sample_id = i['properties']['id']['value']
    for o in outputs:
        if(o['attribute'] == 'sample'):
            output_sample_id = o['properties']['id']['value']
    rr = r.table('samples').filter({'id': output_sample_id}).update({'parent_id': input_sample_id}).run(conn)
    print rr

if __name__ == "__main__":
    parser = optparse.OptionParser()
    parser.add_option("-P", "--port", dest="port",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    conn = r.connect('localhost', int(options.port), db='materialscommons')
    samples = list(r.table('samples').run(conn))
    processes = list(r.table('processes').run(conn))
    for sample in samples:
        for p in processes:
            outputs = []
            if 'outputs' not in p:
                print "process %s does not have an outputs field" % (p['id'])
                continue
            outputs = p['outputs']
            for o in outputs:
                if (o['attribute'] == 'sample'):
                    update_path_for_output_sample(p['inputs'], p['outputs'])
