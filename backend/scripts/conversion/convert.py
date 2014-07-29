#!/usr/bin/env python
#
# This script converts the current production database to the new database
# layout. It consolidates a number of formerly separate scripts into a single
# script that handles conversion, order dependency, etc...
#

import rethinkdb as r
import os
from optparse import OptionParser

port = 30815


def add_projects_to_groups(conn):
    print "  Adding projects to groups..."
    groups = list(r.table('usergroups').run(conn))
    for group in groups:
        owner = group['owner']
        projects = list(r.table('projects').filter({'owner': owner})
                        .pluck('id', 'name').run(conn))
        group['projects'] = projects
        r.table('usergroups').get(group['id']).update(group).run(conn)


def convert_compositions(conn):
    print "  Converting compositions..."
    all_samples = list(r.table('samples').run(conn, time_format='raw'))
    d = dict()
    d = {
        "10 wt% Gd": [{"element": "Gd", "value": 10}],
        "Fe-10.10 wt%": [{"element": "Fe", "value": 10.10}],
        "Fe-14.25 wt%": [{"element": "Fe", "value": 14.25}],
        "Fe-5.4 wt%": [{"element": "Fe", "value": 5.4}],
        "Mg-3.74 Y-2.10 Nd-0.52 Gd-0.45 Zr-0.016 Zn (Wt%)":
        [{"element": "Mg", "value": 93.174}, {"element": "Y", "value": 3.74},
         {"element": "Nd", "value": 2.10}, {"element": "Gd", "value": 0.52},
         {"element": "Zr", "value": 0.45}, {"element": "Zn", "value": 0.016}],
            "Mg-9wt%Al-1wt%Zn": [{"element": "Mg", "value": 90},
                                 {"element": "Al", "value": 9},
                                 {"element": "Zn", "value": 1}],
            "Mg-9wt/o Aluminum": [{"element": "Mg", "value": 91},
                                  {"element": "Al", "value":  9}],
            "MgAl": [{"element": "Mg", "value": 0},
                     {"element": "Al", "value": 0}],
            "Ti-0wt%Al": [{"element": "Ti", "value": 100},
                          {"element": "Al", "value": 0}],
            "Ti-4wt%Al": [{"element": "Ti", "value": 96},
                          {"element": "Al", "value":  4}],
            "Ti-7wt%Al": [{"element": "Ti", "value": 93},
                          {"element": "Al", "value":  7}]
        }
    for sample in all_samples:
        if sample[u'properties'][u'composition'][u'value'] in d:
            v = d[sample[u'properties'][u'composition'][u'value']]
            r.table('samples').get(sample[u'id'])\
                              .update({'properties':
                                       {'composition':
                                        {'value': v,  'unit': 'wt%'}},
                                       'projects': []}).run(conn)


def drop_unused_tables(conn):
    print "  Dropping unused tables..."
    r.table_drop('materials').run(conn)
    r.table_drop('citations').run(conn)
    r.table_drop('dataparams').run(conn)
    r.table_drop('datasets').run(conn)
    r.table_drop('notes').run(conn)
    r.table_drop('project2conditions').run(conn)
    r.table_drop('review2datafile').run(conn)
    r.table_drop('udqueue').run(conn)


def drop_unused_database(conn):
    print "  Dropping unused history database..."
    r.db_drop('history').run(conn)


def populate_new_denorms(conn):
    print "  Populating datafiles_denorm and sample_denorm..."
    all_processes = list(r.table('processes').has_fields('inputs').run(conn))
    for process in all_processes:
        inputs = process['inputs']
        outputs = process['outputs']
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
            if i['attribute'] == 'sample':
                sample_dnorm = {}
                sample_dnorm['sample_id'] = i['properties']['id']['value']
                sample_dnorm['sample_name'] = i['properties']['name']['value']
                sample_dnorm['process_id'] = process['id']
                sample_dnorm['process_name'] = process['name']
                sample_dnorm['project_id'] = process['project']
                sample_dnorm['file_type'] = 'input'
                r.table('samples_denorm').insert(sample_dnorm).run(conn)
                p2s = {}
                p2s['project_id'] = process['project']
                proj = r.table('projects').get(p2s['project_id']).run(conn)
                p2s['project_name'] = proj['name']
                p2s['sample_id'] = sample_dnorm['sample_id']
                items = list(r.table('projects2samples')
                             .get_all(p2s['sample_id'], index='sample_id')
                             .filter({'project_id': p2s['project_id']}).run(conn))
                if not items:
                    r.table('projects2samples').insert(p2s).run(conn)
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
            if o['attribute'] == 'sample':
                sample_dnorm = {}
                sample_dnorm['sample_id'] = o['properties']['id']['value']
                sample_dnorm['sample_name'] = o['properties']['name']['value']
                sample_dnorm['process_id'] = process['id']
                sample_dnorm['process_name'] = process['name']
                sample_dnorm['project_id'] = process['project']
                sample_dnorm['file_type'] = 'output'
                r.table('samples_denorm').insert(sample_dnorm).run(conn)
                p2s = {}
                p2s['project_id'] = process['project']
                proj = r.table('projects').get(p2s['project_id']).run(conn)
                p2s['project_name'] = proj['name']
                p2s['sample_id'] = sample_dnorm['sample_id']
                items = list(r.table('projects2samples')
                             .get_all(p2s['sample_id'], index='sample_id')
                             .filter({'project_id': p2s['project_id']}).run(conn))
                if not items:
                    r.table('projects2samples').insert(p2s).run(conn)


def convert_templates(conn):
    print "  Converting to new templates..."
    r.table('templates').delete().run(conn)
    cmd = "cd .. && ./loadtemplates.sh -p %d" % (port)
    os.system(cmd)


def add_preferences_to_users(conn):
    print "  Adding preferences field to users..."
    users = list(r.table('users').run(conn))
    for user in users:
        r.table('users').get(user['id'])\
                        .update({'preferences': {'templates': []}}).run(conn)


def convert_samples(conn):
    print "  Adding paths to existing samples..."
    r.table('samples').update({'parent_id': ""}).run(conn)
    cmd = "cd .. && ./create_parent_id_for_samples.py --port %d && ./samplepath.py --port %d" % (port, port)
    os.system(cmd)


def main(conn):
    print "Beginning conversion steps:"
    add_projects_to_groups(conn)
    convert_compositions(conn)
    drop_unused_tables(conn)
    drop_unused_database(conn)
    populate_new_denorms(conn)
    convert_templates(conn)
    add_preferences_to_users(conn)
    convert_samples(conn)
    print "Finished."

if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()

    port = options.port

    conn = r.connect('localhost', options.port, db='materialscommons')
    main(conn)
