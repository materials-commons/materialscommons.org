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
    all_processes = r.table('processes').has_fields('inputs').run(conn)
    for process in all_processes:
        inputs = process['inputs']
        outputs = process['outputs']
        if inputs == []:
            print 'no inputs'
        else:
            for i in inputs:
                if i['attribute'] == 'file':
                    df_dnorm = {}
                    df_dnorm['df_id'] = i['properties']['id']['value']
                    df_dnorm['df_name'] = i['properties']['name']['value']
                    df_dnorm['process_id'] = process['id']
                    df_dnorm['process_name'] = process['name']
                    df_dnorm['project_id'] = process['project']
                    df_dnorm['file_type'] = 'input'
                    r.table('datafiles_denorm').insert(df_dnorm).run(conn)
        if outputs == []:
            print 'no outputs'
        else:
            for o in outputs:
                if o['attribute'] == 'file':
                    df_dnorm = {}
                    df_dnorm['df_id'] = o['properties']['id']['value']
                    df_dnorm['df_name'] = o['properties']['name']['value']
                    df_dnorm['process_id'] = process['id']
                    df_dnorm['process_name'] = process['name']
                    df_dnorm['project_id'] = process['project']
                    df_dnorm['file_type'] = 'output'
                    r.table('datafiles_denorm').insert(df_dnorm).run(conn)   